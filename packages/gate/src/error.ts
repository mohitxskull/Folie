import { AxiosError } from 'axios'
import { z } from 'zod'

const ErrorResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  code: z.string(),
  status: z.number(),
  multiple: z.array(
    z.object({
      message: z.string(),
      source: z.string().optional(),
      meta: z.record(z.any()).optional(),
    })
  ),
})

export type GateErrorType =
  | 'path-parser'
  | 'axios'
  | 'axios-response'
  | 'axios-request'
  | 'error'
  | 'unknown'
  | 'gate'

export class GateError extends Error {
  override name = 'Gate Error'

  type: GateErrorType

  axios?: AxiosError<any, any>

  #trace?: string[]

  constructor(
    message: string,
    type: GateErrorType,
    options?: {
      error?: Error
      cause?: object
      axios?: AxiosError<any, any>
    }
  ) {
    super(message, { cause: options?.cause })

    this.type = type

    if (type.includes('axios')) {
      if (options?.axios) {
        this.axios = options.axios
      } else {
        throw new Error("When 'type' includes 'axios', 'options' must include 'axios'", {
          cause: options,
        })
      }
    }

    let stack = this.stack

    if (!stack) {
      Error.captureStackTrace(this, this.constructor)
      stack = this.stack
    }

    if (stack) {
      this.#trace = stack.split('\n').map((line) => line.trim())
    }
  }

  toJSON() {
    return {
      message: this.message,
      type: this.type,
      trace: this.#trace,
      cause: this.cause,
      name: this.name,
      axios: this.axios?.toJSON(),
    }
  }

  parse():
    | {
        success: false
        message: string
        meta?: object
      }
    | {
        success: true
        data: z.infer<typeof ErrorResponseSchema>
      } {
    if (!this.axios?.response) {
      return {
        success: false,
        message: 'Response not found',
      }
    }

    if (!this.axios.response.data) {
      return {
        success: false,
        message: 'Response data not found',
      }
    }

    const data = ErrorResponseSchema.safeParse(this.axios.response.data)

    if (!data.success) {
      return {
        success: false,
        message: 'Response data not valid',
        meta: { error: data.error?.format(), data: this.axios.response.data },
      }
    }

    return {
      success: true,
      data: data.data,
    }
  }
}
