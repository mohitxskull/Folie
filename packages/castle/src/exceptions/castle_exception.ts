import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'
import { ValidationError } from '../types/index.js'

export class CastleException extends Exception {
  readonly parent = 'CastleException'

  declare metadata?: Record<string, unknown>
  declare reason?: unknown
  declare source?: string
  declare errors?: ValidationError[]

  constructor(
    message?: string,
    options?: ErrorOptions & {
      status?: number
      code?: string
      metadata?: Record<string, unknown>
      reason?: unknown
      source?: string
      help?: string
      stack?: string
      errors?: ValidationError[]
    }
  ) {
    super(message, options)

    this.metadata = options?.metadata
    this.reason = options?.reason
    this.source = options?.source
    this.help = options?.help
    this.stack = options?.stack || this.stack
    this.errors = options?.errors
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).json({
      id: ctx.request.id(),
      status: error.status,
      code: error.code,
      message: error.message,
      help: error.help,
      metadata: this.metadata,
      errors: this.errors,
      source: this.source,
    })
  }

  async report(error: this, ctx: HttpContext) {
    if (error.status >= 400 && error.status <= 499) {
      ctx.logger.warn({ err: error, ip: ctx.request.ip() }, error.message)
    } else if (error.status >= 500) {
      ctx.logger.error({ err: error, ip: ctx.request.ip() }, error.message)
    } else {
      ctx.logger.info({ err: error, ip: ctx.request.ip() }, error.message)
    }
  }

  toJSON() {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      help: this.help,
      metadata: this.metadata,
      errors: this.errors,
      source: this.source,
    }
  }
}
