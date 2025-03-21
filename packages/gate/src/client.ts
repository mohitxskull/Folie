import { Header, Token } from './types.js'
import axios, { type AxiosRequestConfig, AxiosInstance, AxiosResponse, isAxiosError } from 'axios'
import qs from 'qs'
import { GateError } from './error.js'
import { ApiEndpoints } from '@folie/lib'

export class Gate<const Endpoints extends ApiEndpoints> {
  #axios: AxiosInstance

  #endpoints: Endpoints
  #baseURL: string

  #token?: Token
  #header?: Header

  constructor(config: { baseURL: URL; endpoints: Endpoints; token?: Token; header?: Header }) {
    this.#endpoints = config.endpoints
    this.#baseURL = config.baseURL.origin

    if (config.token) {
      this.#token = config.token
    }

    if (config.header) {
      this.#header = config.header
    }

    this.#axios = axios.create({
      baseURL: config.baseURL.origin,
      headers: {
        'Content-Type': 'application/json',
      },
      paramsSerializer: (p) => qs.stringify(p),
    })
  }

  setToken(token: Token) {
    this.#token = token
  }

  setHeader(header: Header) {
    this.#header = header
  }

  token(custom?: Token) {
    const target = custom || this.#token

    if (typeof target === 'string') {
      return target
    } else if (typeof target === 'function') {
      return target()
    } else {
      return null
    }
  }

  header(custom?: Header) {
    const target = custom || this.#header

    if (typeof target === 'object') {
      return target
    } else if (typeof target === 'function') {
      return target()
    } else {
      return null
    }
  }

  async #call<
    EK extends keyof Endpoints,
    EP extends Endpoints[EK],
    IN extends EP['io']['input'],
    OUT extends EP['io']['output'],
  >(
    endpointKey: EK,
    input: IN,
    options?: {
      token?: Token
      headers?: Header
    }
  ): Promise<OUT> {
    try {
      const endpoint = this.#endpoints[endpointKey]

      const [token, header] = await Promise.all([
        this.token(options?.token),
        this.header(options?.headers),
      ])

      let config: AxiosRequestConfig = {
        method: endpoint.method,
        url: endpoint.url(),
        headers: {
          ...header,
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': endpoint.form ? 'multipart/form-data' : 'application/json',
        },
      }

      if (input) {
        const { query, params, ...rest } = input

        config = {
          ...config,
          url: endpoint.url({ params, query }),
          data: rest,
        }
      }

      const res: AxiosResponse<OUT, IN> = await this.#axios.request(config)

      return res.data
    } catch (error) {
      if (error instanceof GateError) {
        throw error
      } else if (isAxiosError(error)) {
        throw GateError.fromAxiosError(error)
      } else {
        throw new GateError('Unknown error in client error handler', {
          cause: error,
        })
      }
    }
  }

  async #safeCall<EK extends keyof Endpoints, EP extends Endpoints[EK]>(
    endpointKey: EK,
    input: EP['io']['input']
  ): Promise<[EP['io']['output'], null] | [null, GateError]> {
    try {
      const res = await this.#call(endpointKey, input)

      return [res, null]
    } catch (err) {
      if (err instanceof GateError) {
        return [null, err]
      } else {
        throw err
      }
    }
  }

  endpoint<EK extends keyof Endpoints>(endpointKey: EK) {
    return {
      call: (input: Endpoints[EK]['io']['input']) => this.#call(endpointKey, input),
      safeCall: (input: Endpoints[EK]['io']['input']) => this.#safeCall(endpointKey, input),
    } as const
  }

  url<EK extends keyof Endpoints, EP extends Endpoints[EK]>(
    endpointKey: EK,
    options?: Parameters<EP['url']>[0]
  ) {
    return new URL(this.#endpoints[endpointKey].url(options), this.#baseURL)
  }
}
