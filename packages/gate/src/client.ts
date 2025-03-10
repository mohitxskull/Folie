import { Config, Header, Token } from './types.js'
import axios, { type AxiosRequestConfig, AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import qs from 'qs'
import { GateError } from './error.js'
import { ApiDefinition, EndpointKeys } from '@folie/blueprint-lib'

export class Gate<const Api extends ApiDefinition> {
  #axios: AxiosInstance
  #token?: Token
  #header?: Header

  readonly api: Api
  readonly base: URL

  constructor(params: Config<Api>) {
    this.#token = params.token
    this.#header = params.header

    this.api = params.api
    this.base = params.base

    this.#axios = axios.create({
      baseURL: this.base.origin,
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

  async token() {
    if (typeof this.#token === 'string') {
      return this.#token
    } else if (typeof this.#token === 'function') {
      return this.#token()
    } else {
      return null
    }
  }

  async header() {
    if (typeof this.#header === 'object') {
      return this.#header
    } else if (typeof this.#header === 'function') {
      return this.#header()
    } else {
      return null
    }
  }

  async #call<
    RK extends EndpointKeys<Api>,
    EP extends Api[RK],
    IN extends EP['io']['input'],
    OUT extends EP['io']['output'],
  >(endpointKey: RK, input: IN): Promise<OUT> {
    try {
      const endpoint = this.api[endpointKey]

      const token = await this.token()

      const config: AxiosRequestConfig = {
        data: input,
        params: input?.query,
        method: endpoint.method,
        url: endpoint.path(input?.params as never),
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': endpoint.form ? 'multipart/form-data' : 'application/json',
          ...(await this.header()),
        },
      }

      const res: AxiosResponse<OUT> = await this.#axios.request(config)

      return res.data
    } catch (error) {
      if (error instanceof GateError) {
        throw error
      } else if (error instanceof AxiosError) {
        if (error.response) {
          throw new GateError('Axios Response Error', 'axios-response', {
            error: error,
            axios: error,
          })
        } else if (error.request) {
          throw new GateError('Axios Request Error', 'axios-request', {
            error: error,
            axios: error,
          })
        } else {
          throw new GateError('Axios Error', 'axios', {
            error: error,
            axios: error,
          })
        }
      } else if (error instanceof Error) {
        throw new GateError(`Unknown error in client error handler: ${error.message}`, 'error', {
          error,
        })
      } else {
        throw new GateError('Unknown error in client error handler', 'unknown', {
          cause: {
            originalError: error,
          },
        })
      }
    }
  }

  async #safeCall<EK extends EndpointKeys<Api>, EP extends Api[EK]>(
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

  endpoint<RK extends EndpointKeys<Api>>(endpointKey: RK) {
    return {
      call: (input: Api[RK]['io']['input']) => this.#call(endpointKey, input),
      safeCall: (input: Api[RK]['io']['input']) => this.#safeCall(endpointKey, input),
    } as const
  }

  url<EK extends EndpointKeys<Api>, EP extends Api[EK]>(
    endpointKey: EK,
    params: NonNullable<EP['io']['input']>['params']
  ) {
    return new URL(this.api[endpointKey].path(params as any), this.base)
  }
}
