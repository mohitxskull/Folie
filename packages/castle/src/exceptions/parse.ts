import { InternalServerErrorException, UnprocessableEntityException } from './http_exceptions.js'
import { CastleException } from './castle_exception.js'
import { errors } from '@vinejs/vine'
import { Exception } from '@adonisjs/core/exceptions'
import { ValidationError } from '../types/index.js'

export const parseError = (error: unknown) => {
  if (error instanceof CastleException) {
    return error
  } else if (error instanceof errors.E_VALIDATION_ERROR) {
    const messages: ValidationError[] = error.messages

    return new UnprocessableEntityException(undefined, {
      errors: messages,
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
    return new InternalServerErrorException(undefined, {
      cause: error,
    })
  }
}
