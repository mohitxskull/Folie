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

export class GateError extends Error {
  #response?: z.infer<typeof ErrorResponseSchema>

  #trace?: string[]

  constructor(
    message: string,
    options?: {
      cause?: unknown
      stack?: string
      response?: z.infer<typeof ErrorResponseSchema>
    }
  ) {
    super(message, { cause: options?.cause })

    this.name = 'GateError'

    Object.setPrototypeOf(this, new.target.prototype)

    this.#response = options?.response

    let stack = options?.stack || this.stack

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
      name: this.name,
      message: this.message,
      trace: this.#trace,
      cause: this.cause,
      response: this.#response,
    }
  }

  static fromAxiosError(error: AxiosError): GateError {
    const data = ErrorResponseSchema.safeParse(error.response?.data)

    const response = data.success ? data.data : undefined

    return new GateError(error.message, { cause: error, stack: error.stack, response })
  }
}
