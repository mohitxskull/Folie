import { AxiosError } from 'axios'
import { z } from 'zod'

const ErrorResponseSchema = z.object({
  id: z.string(),
  status: z.number(),
  code: z.string(),
  message: z.string(),
  source: z.string().optional(),
  metadata: z
    .union([
      z.record(z.string(), z.unknown()),
      z.array(
        z.object({
          message: z.string(),
          field: z.string(),
        })
      ),
    ])
    .optional(),
})

export class GateError extends Error {
  #response?: z.infer<typeof ErrorResponseSchema>

  constructor(
    message: string,
    options?: {
      cause?: unknown
      response?: z.infer<typeof ErrorResponseSchema>
      stack?: string
    }
  ) {
    super(message, { cause: options?.cause })

    this.name = 'GateError'

    this.#response = options?.response

    if (options?.stack) {
      this.stack = options.stack
    } else {
      const ErrorConstructor = this.constructor as typeof GateError

      if ('captureStackTrace' in Error) {
        Error.captureStackTrace(this, ErrorConstructor)
      }
    }
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  toString() {
    return `${this.name}: ${this.message}`
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
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
