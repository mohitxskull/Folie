import { ApiEndpoints } from '@folie/blueprint-lib'

export type MaybePromise<T> = T | Promise<T>

export type Token = string | (() => MaybePromise<string | null>)

export type Header = Record<string, string> | (() => MaybePromise<Record<string, string> | null>)

export type Config<Endpoints extends ApiEndpoints> = {
  baseURL: URL
  endpoints: Endpoints
  token?: Token
  header?: Header
}
