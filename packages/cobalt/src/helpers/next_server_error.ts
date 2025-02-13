import { GateError } from '@folie/gate'
import { GetServerSidePropsResult, Redirect } from 'next'

/**
 * @property { '404' } type - Indicates a 404 Not Found error.
 * @property { 'redirect' } type - Indicates a redirect response.
 * @property { Redirect } redirect - The Next.js Redirect object containing the destination and permanent flag for redirection.
 */
type NextServerErrorResponse = { type: '404' } | { type: 'redirect'; redirect: Redirect }

/**
 * Represents a custom error class specifically designed for handling server-side errors within Next.js `getServerSideProps` functions.
 *
 * This class extends the built-in `Error` class and provides a structured way to represent different types of server-side errors
 * that need to be handled in Next.js, such as 404 Not Found errors or redirects. It includes functionalities for generating
 * appropriate `GetServerSidePropsResult` objects for these error scenarios, reporting errors to the console, and customizing
 * JSON serialization for error logging or reporting.
 *
 * @class NextServerError
 * @extends {Error}
 */
export class NextServerError extends Error {
  override name = 'Next Server Error'

  /**
   * @private
   * @type {NextServerErrorResponse}
   * @memberof NextServerError
   * @description The structured error response object containing the type of error and related data.
   */
  #response: NextServerErrorResponse
  /**
   * @private
   * @type {string[] | undefined}
   * @memberof NextServerError
   * @description An array of strings representing the parsed stack trace of the error, useful for debugging.
   */
  #trace?: string[]

  /**
   * Creates a new instance of NextServerError.
   *
   * @constructor
   * @param {NextServerErrorResponse} response - The structured error response object defining the error type and details.
   * @param {unknown} [cause] - An optional value representing the underlying cause of this error, for error chaining and debugging.
   *
   * @example
   * // Example for a 404 Not Found error:
   * throw new NextServerError({ type: '404' });
   *
   * @example
   * // Example for a redirect error:
   * throw new NextServerError({ type: 'redirect', redirect: { destination: '/login', permanent: false } });
   */
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

  /**
   * Handles the NextServerError and returns a `GetServerSidePropsResult` object suitable for Next.js.
   *
   * This method transforms the error into a format that Next.js `getServerSideProps` can understand and use to render
   * error pages or redirects.
   *
   * @method handle
   * @template T
   * @returns {GetServerSidePropsResult<T>} A `GetServerSidePropsResult` object configured based on the error type.
   *          For '404' errors, it returns `{ notFound: true }`.
   *          For 'redirect' errors, it returns `{ redirect: Redirect }`.
   * @throws {Error} Throws an error if the `response.type` is unknown, indicating an unexpected error state.
   *
   * @example
   * // In getServerSideProps:
   * try {
   *   // ... some server-side logic ...
   * } catch (error) {
   *   if (error instanceof NextServerError) {
   *     return error.handle();
   *   }
   *   // ... handle other types of errors ...
   * }
   */
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

  /**
   * Reports the error by logging its JSON representation to the console (error level).
   *
   * This method is useful for quickly logging error details, including the response type, stack trace, and cause,
   * for debugging and monitoring purposes. It uses the `toJSON` method to serialize the error object.
   *
   * @method report
   * @returns {void}
   *
   * @example
   * try {
   *   // ... some code that might throw NextServerError ...
   * } catch (error) {
   *   if (error instanceof NextServerError) {
   *     error.report(); // Log the error details to console.error
   *   }
   * }
   */
  report(): void {
    console.error(this.toJSON())
  }

  /**
   * Static factory method to create a NextServerError instance for a 404 Not Found error.
   *
   * @static
   * @method notFound
   * @param {Error} [cause] - An optional Error object that caused this 404 error.
   * @returns {NextServerError} A new NextServerError instance configured for a 404 Not Found response.
   *
   * @example
   * throw NextServerError.notFound();
   */
  static notFound(cause?: Error): NextServerError {
    return new NextServerError({ type: '404' }, cause)
  }

  /**
   * Static factory method to create a NextServerError instance for a redirect response.
   *
   * @static
   * @method redirect
   * @param {Redirect} redirect - The Next.js Redirect object specifying the destination and permanent flag for redirection.
   * @param {Error} [cause] - An optional Error object that caused this redirect error.
   * @returns {NextServerError} A new NextServerError instance configured for a redirect response.
   *
   * @example
   * throw NextServerError.redirect({ destination: '/login', permanent: false });
   */
  static redirect(redirect: Redirect, cause?: Error): NextServerError {
    return new NextServerError({ type: 'redirect', redirect }, cause)
  }

  /**
   * Static factory method to create a NextServerError instance from an unknown error.
   *
   * If the provided error is already a NextServerError, it is returned directly. Otherwise, a new NextServerError
   * with a 404 Not Found response type is created, using the given error as the cause. This is useful for
   * converting generic errors into NextServerError instances for consistent error handling in `getServerSideProps`.
   *
   * @static
   * @method fromError
   * @param {unknown} error - The error object to convert. It can be a NextServerError or any other error type.
   * @returns {NextServerError} Returns the provided error if it's a NextServerError, otherwise returns a new NextServerError with a 404 type.
   *
   * @example
   * try {
   *   // ... some code that might throw any type of error ...
   * } catch (error) {
   *   throw NextServerError.fromError(error); // Convert any error to NextServerError for handling
   * }
   */
  static fromError(error: unknown): NextServerError {
    if (error instanceof NextServerError) {
      return error
    } else {
      return new NextServerError({ type: '404' }, error)
    }
  }

  /**
   * Customizes the JSON serialization of the NextServerError object.
   *
   * This method defines how the NextServerError instance should be converted into a JSON string when `JSON.stringify()`
   * is called. It includes the error response details, the parsed stack trace, and the cause of the error in the serialized output.
   *
   * @method toJSON
   * @returns {{ response: NextServerErrorResponse, trace?: string[], cause: unknown }} An object representing the JSON-serializable form of the NextServerError.
   *
   * @example
   * const error = NextServerError.notFound();
   * const jsonError = JSON.stringify(error); // jsonError will be a string representation of the object returned by toJSON()
   */
  toJSON(): { response: NextServerErrorResponse; trace?: string[]; cause: unknown } {
    return {
      response: this.#response,
      trace: this.#trace,
      cause: this.cause,
    }
  }
}
