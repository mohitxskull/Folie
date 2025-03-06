import { ApiDefinition } from '@folie/blueprint-lib'

export type Token = string | (() => string | null) | (() => Promise<string | null>)

export type Header =
  | Record<string, string>
  | (() => Record<string, string> | null)
  | (() => Promise<Record<string, string> | null>)

export type Config<Api extends ApiDefinition> = {
  base: URL
  api: Api
  token?: Token
  header?: Header
}
