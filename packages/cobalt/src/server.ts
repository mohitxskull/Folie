import { RouteKeys, Routes } from '@folie/blueprint-lib'
import { Gate } from '@folie/gate'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { createStringGetter } from './helpers/create_string_getter.js'
import { NextServerError } from './helpers/next_server_error.js'
import { CheckpointParams } from './types/server.js'

/**
 * CobaltServer is a comprehensive utility class designed to simplify and standardize server-side logic in Next.js applications.
 * It provides built-in functionalities for session management, route security, parameter extraction, and error handling,
 * making it easier to build robust and secure server-rendered pages.
 *
 * @class CobaltServer
 * @template ROUTES - An interface that extends `@folie/blueprint-lib`'s `Routes` type. This defines the structure of your application's API routes,
 *                     including input and output types for each endpoint, as used by the `Gate` API client.
 * @template SCERK - A key from `RouteKeys<ROUTES>` that specifically identifies the session validation endpoint within your `ROUTES` definition.
 *                   This endpoint is used to verify the user's session cookie on the server.
 * @template KEYS - A string type that represents the keys for route parameters expected in your Next.js pages.
 *                  Defaults to `never` if your pages do not use route parameters. This helps in type-safe parameter extraction within your server-side functions.
 */
export class CobaltServer<
  ROUTES extends Routes,
  SCERK extends RouteKeys<ROUTES>,
  KEYS extends string = never,
> {
  api: Gate<ROUTES>
  routes: ROUTES

  /**
   * @property {object} sessionConfig - Configuration for session management.
   *  This configuration is used by CobaltServer to handle user sessions, including reading the session cookie and validating it against a designated API endpoint.
   * @property {string} sessionConfig.cookie - The name of the HTTP cookie where the session token is stored.
   *  This name is used to look up the session token in the incoming request cookies.
   * @property {SCERK} sessionConfig.endpoint - The route key, as defined in your `ROUTES` type, that points to the API endpoint responsible for validating the session.
   *  CobaltServer will call this endpoint to ensure the session token is valid.
   */
  sessionConfig: {
    cookie: string
    endpoint: SCERK
  }

  /**
   * @property {object} secureConfig - Configuration for handling secure routes.
   *  This configuration dictates how CobaltServer should behave when a user attempts to access a route secured by the `secure` or `server` methods.
   * @property {string} secureConfig.redirect - The URL to which users should be redirected if they attempt to access a secure route without a valid session or when a security checkpoint fails.
   *  This is typically a login page or another appropriate location within your application.
   */
  secureConfig: {
    redirect: string
  }

  /**
   * Constructor for the CobaltServer class.
   *
   * @constructor
   * @param {object} params - Configuration parameters for the CobaltServer.
   * @param {Gate<ROUTES>} params.api - An instance of the Gate API client, pre-configured with route definitions.
   * @param {ROUTES} params.routes - The application's route definitions, conforming to the `Routes` interface.
   * @param {object} params.session - Session management configuration.
   * @param {string} params.session.cookie - Cookie name used for storing the session token.
   * @param {SCERK} params.session.endpoint - Route key of the API endpoint used to validate the session.
   * @param {object} params.secure - Secure route handling configuration.
   * @param {string} params.secure.redirect - Default redirect URL for unauthorized access to secure routes.
   */
  constructor(params: {
    api: Gate<ROUTES>
    routes: ROUTES
    session: {
      /** Cookie name used for session */
      cookie: string
      endpoint: SCERK
    }
    secure: {
      redirect: string
    }
  }) {
    this.api = params.api
    this.routes = params.routes

    this.sessionConfig = params.session
    this.secureConfig = params.secure
  }

  /**
   * Fetches session data from the session cookie.
   *
   * @async
   * @method session
   * @private
   * @param {GetServerSidePropsContext} ctx - The Next.js GetServerSideProps context object.
   * @returns {Promise<ROUTES[SCERK]['io']['output'] | null>} - A promise resolving to the session data if valid session cookie is present, otherwise null.
   */
  #session = async (
    ctx: GetServerSidePropsContext
  ): Promise<ROUTES[SCERK]['io']['output'] | null> => {
    const sessionCookie = ctx.req.cookies[this.sessionConfig.cookie]

    if (!sessionCookie) {
      return null
    }

    this.api.setToken(sessionCookie)

    const [res] = await this.api.endpoint(this.sessionConfig.endpoint).safeCall(undefined)

    return res
  }

  /**
   * Creates a higher-order function to secure server-side rendered pages.
   * It checks for a valid session and optionally runs a custom checkpoint function to determine access.
   *
   * @method secure
   * @param {object} [params] - Optional parameters for secure route handling.
   * @param {function} [params.checkpoint] - An optional checkpoint function to perform custom authorization logic.
   *                                        It receives context and session data and should return a `CheckpointParams` object.
   * @returns {function} - An asynchronous function to be used in `getServerSideProps` to secure a page.
   *
   * @example
   * // Secure a page, redirecting to '/login' if no session
   * export const getServerSideProps = server.secure();
   *
   * @example
   * // Redirect user if logged in
   * export const getServerSideProps = cobaltServer.secure({
   *  checkpoint: ({ session }) => {
   *    return {
   *      allow: !session,
   *      redirect: "/app",
   *    };
   *  },
   * });
   */
  secure = (params?: {
    checkpoint?: (params: {
      ctx: GetServerSidePropsContext
      session: ROUTES[SCERK]['io']['output'] | null
    }) => CheckpointParams
  }): GetServerSideProps<{
    session: ROUTES[SCERK]['io']['output']
  }> => {
    return async (ctx: GetServerSidePropsContext) => {
      const session = await this.#session(ctx)

      const condition = params?.checkpoint
        ? params.checkpoint({ ctx, session })
        : { allow: session !== null, redirect: this.secureConfig.redirect }

      if (condition.allow === false) {
        return {
          redirect: {
            destination: condition.redirect,
            permanent: false,
          },
        }
      }

      return {
        props: {
          session,
        },
      }
    }
  }

  server = <T extends { [key: string]: any }>(
    callback: (params: {
      session: ROUTES[SCERK]['io']['output'] | null
      ctx: GetServerSidePropsContext
      params: (key: KEYS) => string
      api: Gate<ROUTES>
    }) => Promise<GetServerSidePropsResult<T>>,
    options?: {
      secure?:
        | ((params: {
            ctx: GetServerSidePropsContext
            session: ROUTES[SCERK]['io']['output'] | null
          }) => CheckpointParams)
        | true
    }
  ): GetServerSideProps<T> => {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
      try {
        const session = await this.#session(ctx)

        if (options?.secure) {
          if (typeof options?.secure === 'function') {
            const condition = options?.secure({ ctx, session })

            if (condition.allow === false) {
              return {
                redirect: {
                  destination: condition.redirect,
                  permanent: false,
                },
              }
            }
          } else {
            if (session === null) {
              return {
                redirect: {
                  destination: this.secureConfig.redirect,
                  permanent: false,
                },
              }
            }
          }
        }

        const getter = createStringGetter<KEYS>(ctx.params ?? {})

        const params = (key: KEYS) => {
          const res = getter(key)

          if (!res) {
            throw new NextServerError({ type: '404' })
          }

          return res
        }

        const res = await callback({ session, ctx, params, api: this.api })

        return res
      } catch (error) {
        const e = NextServerError.fromError(error)

        e.report()

        return e.handle<T>()
      }
    }
  }
}
