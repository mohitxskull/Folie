import { HTTPStatusCodeKeys } from '@folie/lib'

export type ValidationError = {
  message: string
  field: string
  rule: string
  index?: number
  meta?: Record<string, any>
}

type InternalMeta = {
  reason?: string
  public?: object
  [key: string]: unknown
}

type OptionsBase = {
  /**
   * The HTTP status code applicable to this problem, expressed as a number value. Like: 200, 404
   */
  status?: HTTPStatusCodeKeys

  /**
   * A short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization.
   */
  title?: string

  stack?: string
  error?: unknown
}

export type ProcessingExceptionOptions = OptionsBase & {
  /**
   * An containing references to the primary source of the error.
   */
  source?: string

  /**
   * a meta object containing non-standard meta-information about the error.
   */
  meta?: InternalMeta

  multiple?: {
    message: string
    source?: string
    meta?: InternalMeta
  }[]
}

export type ProcessingExceptionResponse = {
  id: string
  title: string
  status: number
  code: HTTPStatusCodeKeys
  multiple: {
    message: string
    source?: string
    meta?: Record<string, any>
  }[]
}
