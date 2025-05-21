/// <reference types="@adonisjs/core/providers/vinejs_provider" />

import type { ApplicationService } from '@adonisjs/core/types'
import { Request } from '@adonisjs/core/http'
import type { VineValidator } from '@vinejs/vine'
import type {
  Infer,
  SchemaTypes,
  ErrorReporterContract,
  MessagesProviderContact,
} from '@vinejs/vine/types'

import type { HttpContext } from '@adonisjs/core/http'
import { RequestValidationOptions } from '@adonisjs/core/types/http'

/**
 * Request validator is used validate HTTP request data using
 * VineJS validators. You may validate the request body,
 * files, cookies, and headers.
 */
class RequestValidator {
  #ctx: HttpContext

  constructor(ctx: HttpContext) {
    this.#ctx = ctx
  }

  /**
   * The error reporter method returns the error reporter
   * to use for reporting errors.
   *
   * You can use this function to pick a different error reporter
   * for each HTTP request
   */
  static errorReporter?: (_: HttpContext) => ErrorReporterContract

  /**
   * The messages provider method returns the messages provider to use
   * finding custom error messages
   *
   * You can use this function to pick a different messages provider for
   * each HTTP request
   */
  static messagesProvider?: (_: HttpContext) => MessagesProviderContact

  /**
   * The validate method can be used to validate the request
   * data for the current request using VineJS validators
   */
  validateUsing<Schema extends SchemaTypes, MetaData extends undefined | Record<string, any>>(
    validator: VineValidator<Schema, MetaData>,
    ...[options]: [undefined] extends MetaData
      ? [options?: RequestValidationOptions<MetaData> | undefined]
      : [options: RequestValidationOptions<MetaData>]
  ): Promise<Infer<Schema>> {
    const validatorOptions: RequestValidationOptions<any> = options || {}

    /**
     * Assign request specific error reporter
     */
    if (RequestValidator.errorReporter && !validatorOptions.errorReporter) {
      const errorReporter = RequestValidator.errorReporter(this.#ctx)
      validatorOptions.errorReporter = () => errorReporter
    }

    /**
     * Assign request specific messages provider
     */
    if (RequestValidator.messagesProvider && !validatorOptions.messagesProvider) {
      validatorOptions.messagesProvider = RequestValidator.messagesProvider(this.#ctx)
    }

    /**
     * Data to validate
     */
    const data = validatorOptions.data || {
      ...this.#ctx.request.body(),
      ...this.#ctx.request.allFiles(),
      params: this.#ctx.request.params(),
      headers: this.#ctx.request.headers(),
      cookies: this.#ctx.request.cookiesList(),
      query: this.#ctx.request.qs(),
    }

    return validator.validate(data, validatorOptions as any)
  }
}

export default class RequestValidatorProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * The container bindings have booted
   */
  async boot() {
    /**
     * The validate method can be used to validate the request
     * data for the current request using VineJS validators
     */
    Request.macro('validateUsing', function (this: Request, ...args) {
      return new RequestValidator(this.ctx!).validateUsing(...args)
    })
  }
}
