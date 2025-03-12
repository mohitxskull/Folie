import { GateError } from '@folie/gate'
import { GetServerSidePropsResult, Redirect } from 'next'
import { NextServerErrorResponse } from './types.js'

export class NextServerError extends Error {
  override name = 'Next Server Error'

  #response: NextServerErrorResponse
  #trace?: string[]

  constructor(response: NextServerErrorResponse, cause?: unknown) {
    super('Next Server Error') // Call super constructor with a default message and cause

    this.#response = response // Store the provided error response

    let stack = this.stack // Get the initial stack trace

    // If stack trace is not available (in some environments), capture it explicitly
    if (!stack) {
      Error.captureStackTrace(this, this.constructor)
      stack = this.stack // Re-assign stack after capturing it
    }

    // If stack trace is available, parse and store it
    if (stack) {
      this.#trace = stack.split('\n').map((line) => line.trim())
    }

    if (cause) {
      if (cause instanceof GateError) {
        this.cause = cause.toJSON()
      } else {
        this.cause = cause
      }
    }
  }

  handle<T>(): GetServerSidePropsResult<T> {
    switch (this.#response.type) {
      case '404':
        return { notFound: true }
      case 'redirect':
        return {
          redirect: this.#response.redirect,
        }
      default:
        throw new Error(`Unknown Error Type`, {
          cause: {
            response: this.#response,
          },
        })
    }
  }

  report(): void {
    console.error(this.toJSON())
  }

  static notFound(cause?: Error): NextServerError {
    return new NextServerError({ type: '404' }, cause)
  }

  static redirect(redirect: Redirect, cause?: Error): NextServerError {
    return new NextServerError({ type: 'redirect', redirect }, cause)
  }

  static fromError(error: unknown): NextServerError {
    if (error instanceof NextServerError) {
      return error
    } else {
      return new NextServerError({ type: '404' }, error)
    }
  }

  toJSON(): { response: NextServerErrorResponse; trace?: string[]; cause: unknown } {
    return {
      response: this.#response,
      trace: this.#trace,
      cause: this.cause,
    }
  }
}
