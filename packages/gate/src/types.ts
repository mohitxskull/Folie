export type MaybePromise<T> = T | Promise<T>

export type Token = string | (() => MaybePromise<string | null>)

export type Header = Record<string, string> | (() => MaybePromise<Record<string, string> | null>)
