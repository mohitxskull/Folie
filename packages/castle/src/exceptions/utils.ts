import { InternalServerErrorException, UnprocessableEntityException } from './http_exceptions.js'
import { CastleException } from './castle_exception.js'
import { errors } from '@vinejs/vine'
import { Exception } from '@adonisjs/core/exceptions'
import { ValidationError } from '../types/index.js'

/**
 * Converts various error types into standardized CastleException instances.
 *
 * This function provides a centralized way to handle different error types
 * and convert them into consistent CastleException format for uniform
 * error handling across the application.
 *
 * @param error - The error to be parsed and converted
 * @returns A CastleException instance appropriate for the input error type
 *
 * @example
 * ```typescript
 * try {
 *   // Some operation that might throw
 * } catch (error) {
 *   const castleError = parseError(error)
 *   throw castleError
 * }
 * ```
 *
 * Handles the following error types:
 * - CastleException: Returns as-is
 * - VineJS validation errors: Converts to UnprocessableEntityException with validation metadata
 * - AdonisJS Exception: Converts to CastleException preserving status and code
 * - SyntaxError: Converts to InternalServerErrorException
 * - Unknown errors: Converts to generic InternalServerErrorException
 */
export const parseError = (error: unknown) => {
  if (error instanceof CastleException) {
    return error
  } else if (error instanceof errors.E_VALIDATION_ERROR) {
    const messages: ValidationError[] = error.messages

    return new UnprocessableEntityException({
      metadata: messages,
    })
  } else if (error instanceof Exception) {
    // Don't add stack, adonisjs will automatically print the stack
    // of error which is causing it
    return new CastleException(error.message, {
      status: error.status,
      code: error.code,
      help: error.help,
      cause: error,
    })
  } else if (error instanceof SyntaxError) {
    return new InternalServerErrorException(error.message, {
      cause: error,
    })
  } else {
    return new InternalServerErrorException({
      cause: error,
    })
  }
}

/**
 * Type guard to check if a value is an AdonisJS Exception instance.
 *
 * This function performs runtime type checking to determine if the provided
 * value is a valid AdonisJS Exception. It checks for the required properties
 * and structure that define an Exception.
 *
 * @param value - The value to check
 * @returns True if the value is an Exception, false otherwise
 *
 * @example
 * ```typescript
 * if (isException(someError)) {
 *   // TypeScript now knows someError is an Exception
 *   console.log(someError.status)
 * }
 * ```
 */
export const isException = (value: unknown): value is Exception => {
  return (
    typeof value === 'object' &&
    value !== null &&
    value instanceof Error &&
    'name' in value &&
    typeof (value as Exception).name === 'string' &&
    value.name === 'Exception'
  )
}

/**
 * Type guard to check if a value is a CastleException instance.
 *
 * This function performs runtime type checking to determine if the provided
 * value is a valid CastleException. It checks for the 'parent' property
 * that identifies CastleException instances and validates the structure.
 *
 * @param value - The value to check
 * @returns True if the value is a CastleException, false otherwise
 *
 * @example
 * ```typescript
 * if (isCastleException(someError)) {
 *   // TypeScript now knows someError is a CastleException
 *   console.log(someError.metadata)
 *   console.log(someError.source)
 * }
 * ```
 *
 * Validates:
 * - Object is not null and is an Error instance
 * - Has 'parent' property with value 'CastleException'
 * - Has 'name' property that ends with 'Exception'
 */
export const isCastleException = (value: unknown): value is CastleException => {
  return (
    typeof value === 'object' &&
    value !== null &&
    value instanceof Error &&
    'parent' in value &&
    typeof (value as CastleException).parent === 'string' &&
    value.parent === 'CastleException' &&
    'name' in value &&
    typeof (value as CastleException).name === 'string' &&
    value.name.endsWith('Exception')
  )
}
