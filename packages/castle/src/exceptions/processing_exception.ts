import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import {
  ProcessingExceptionOptions,
  ProcessingExceptionResponse,
  ValidationError,
} from '../types/processing_exception.js'
import stringHelpers from '@adonisjs/core/helpers/string'

class ProcessingException extends Exception {
  title: string
  message: string

  // ==================

  status: number
  code: string
  trace?: string[]

  options?: ProcessingExceptionOptions

  #parseStack = (stack: string): string[] => {
    return stack.split('\n').map((line) => stringHelpers.condenseWhitespace(line))
  }

  constructor(message: string, options?: ProcessingExceptionOptions)
  constructor(options?: ProcessingExceptionOptions)
  constructor(
    paramOne?: string | ProcessingExceptionOptions,
    paramTwo?: ProcessingExceptionOptions
  ) {
    const parsedOptions = typeof paramOne === 'object' ? paramOne : paramTwo
    const parsedMessage =
      typeof paramOne === 'string' ? paramOne : 'An error occurred while processing your request.'

    super(parsedMessage)

    this.title = parsedOptions?.title || 'Processing error'
    this.message = parsedMessage
    this.status = parsedOptions?.status || 400
    this.code = parsedOptions?.code || 'E_BAD_REQUEST'
    this.options = parsedOptions

    if (parsedOptions?.stack) {
      this.trace = this.#parseStack(parsedOptions.stack)
    } else {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor)

        this.trace = this.stack ? this.#parseStack(this.stack) : undefined
      } else {
        const stack = new Error().stack

        this.trace = stack ? this.#parseStack(stack) : undefined
      }
    }
  }

  async handle(e: this, ctx: HttpContext) {
    const res: ProcessingExceptionResponse = {
      id: ctx.request.id() || 'unknown',
      title: e.title,
      status: e.status,
      code: e.code,

      multiple: [
        {
          message: e.message,
          source: e.options?.source,
          meta: e.options?.meta?.public,
        },
      ],
    }

    if (e.options?.multiple) {
      res.multiple = e.options.multiple.map((item) => ({
        message: item.message,
        source: item.source,
        meta: item.meta?.public,
      }))
    }

    ctx.response.status(e.status).json(res)
  }

  async report(e: this, ctx: HttpContext) {
    ctx.logger.error(
      {
        ip: ctx.request.ip(),
        status: e.status,
        code: e.code,
        multiple: [
          {
            message: e.message,
            source: e.options?.source,
            meta: e.options?.meta?.public,
          },
          ...(e.options?.multiple ?? []),
        ],
        error: e.options?.error,
        trace: e.trace,
      },
      e.title
    )
  }

  static fromError(error: unknown) {
    if (error instanceof ProcessingException) {
      return error
    } else if (error instanceof errors.E_VALIDATION_ERROR) {
      const messages: ValidationError[] = error.messages

      return new ProcessingException(error.message, {
        status: error.status,
        code: error.code,
        stack: error.stack,
        multiple: messages.map((m) => ({
          message: m.message,
          source: m.field,
          meta: {
            public: {
              ...m.meta,
              rule: m.rule,
              index: m.index,
            },
          },
        })),
      })
    } else if (error instanceof Exception) {
      return new ProcessingException(error.message, {
        status: error.status,
        code: error.code,
        stack: error.stack,
        meta: {
          cause: error.cause,
          public: {
            help: error.help,
          },
        },
      })
    } else if (error instanceof Error) {
      return new ProcessingException('Internal Server Error', {
        status: 500,
        code: 'E_INTERNAL_SERVER_ERROR',
        meta: {
          error: {
            name: error.name,
            message: error.message,
            cause: error.cause,
          },
        },
        stack: error.stack,
      })
    } else {
      return new ProcessingException('Internal Server Error', {
        status: 500,
        code: 'E_INTERNAL_SERVER_ERROR',
        meta: {
          reason: 'Unknown error',
        },
        error,
      })
    }
  }
}

export { ProcessingException }
