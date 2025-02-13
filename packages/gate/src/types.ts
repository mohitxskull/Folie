import { Routes } from '@folie/blueprint-lib'

export type Token = string | (() => string | null) | (() => Promise<string | null>)

export type Header =
  | Record<string, string>
  | (() => Record<string, string> | null)
  | (() => Promise<Record<string, string> | null>)

export type Config<ROUTES extends Routes> = {
  base: URL
  routes: ROUTES
  token?: Token
  header?: Header
}
