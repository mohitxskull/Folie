import { Config, Header, Token } from './types.js'
import axios, { type AxiosRequestConfig, AxiosInstance, AxiosResponse, isAxiosError } from 'axios'
import qs from 'qs'
import { GateError } from './error.js'
import { ApiEndpoints, EndpointKeys } from '@folie/blueprint-lib'

export class Gate<const Endpoints extends ApiEndpoints> {
  #axios: AxiosInstance

  #config: Config<Endpoints>

  constructor(config: Config<Endpoints>) {
    this.#config = config

    this.#axios = axios.create({
      baseURL: this.#config.baseURL.origin,
      headers: {
        'Content-Type': 'application/json',
      },
      paramsSerializer: (p) => qs.stringify(p),
    })
  }

  setToken(token: Token) {
    this.#config.token = token
  }

  setHeader(header: Header) {
    this.#config.header = header
  }

  token(custom?: Token) {
    const target = custom || this.#config.token

    if (typeof target === 'string') {
      return target
    } else if (typeof target === 'function') {
      return target()
    } else {
      return null
    }
  }

  header(custom?: Header) {
    const target = custom || this.#config.header

    if (typeof target === 'object') {
      return target
    } else if (typeof target === 'function') {
      return target()
    } else {
      return null
    }
  }

  async #call<
    EK extends EndpointKeys<Endpoints>,
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
      const endpoint = this.#config.endpoints[endpointKey]

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

  async #safeCall<EK extends EndpointKeys<Endpoints>, EP extends Endpoints[EK]>(
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

  endpoint<RK extends EndpointKeys<Endpoints>>(endpointKey: RK) {
    return {
      call: (input: Endpoints[RK]['io']['input']) => this.#call(endpointKey, input),
      safeCall: (input: Endpoints[RK]['io']['input']) => this.#safeCall(endpointKey, input),
    } as const
  }

  url<EK extends EndpointKeys<Endpoints>, EP extends Endpoints[EK]>(
    endpointKey: EK,
    options?: {
      params?: NonNullable<EP['io']['input']>['params']
      query?: NonNullable<EP['io']['input']>['query']
    }
  ) {
    return new URL(
      this.#config.endpoints[endpointKey].url({ params: options?.params, query: options?.query }),
      this.#config.baseURL
    )
  }
}
