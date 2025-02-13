import { RouteKeys, Routes } from '@folie/blueprint-lib'
import { Gate } from '@folie/gate'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { createStringGetter } from './helpers/create_string_getter'
import { NextServerError } from './helpers/next_server_error'
import { CheckpointParams } from './types/server'

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

  /**
   * Creates a higher-order function to handle server-side rendering logic with session management, security, and error handling.
   * This method is the core of CobaltServer, providing a streamlined way to implement `getServerSideProps` in Next.js.
   * It automatically handles session retrieval, security checks, route parameter extraction, and centralized error handling.
   *
   * @method server
   * @template T - The type of the `props` object that will be passed to your page component. This defines the data your page expects to receive from `getServerSideProps`.
   * @template CTX - The type of the context object. Defaults to `GetServerSidePropsContext` from Next.js, but can be extended if needed for custom context augmentation.
   * @param {function} callback - The main server-side logic function where you implement your data fetching and processing.
   *                              This function is executed within the `getServerSideProps` context and provides access to session data, request context, route parameters, and the API client.
   * @param {object} callback.params - An object containing parameters passed to the callback function.
   * @param {ROUTES[SCERK]['io']['output'] | null} callback.params.session - The session data, automatically retrieved and validated by CobaltServer.
   *                                         Will be `null` if no valid session is found or if session retrieval fails.
   * @param {CTX} callback.params.ctx - The Next.js `GetServerSidePropsContext` object, providing access to request, response, query parameters, and more.
   * @param {function} callback.params.params - A function to safely extract route parameters by key.
   *                                            Call `callback.params('paramKey')` to get the string value of the route parameter 'paramKey'.
   *                                            Throws a `NextServerError` with a 404 status if the parameter is not found.
   * @param {Gate<ROUTES>} callback.params.api -  The configured `Gate` API client instance, pre-set with the session token (if available).
   *                                               Use this to make API requests to your backend services.
   * @param {boolean | function} [secure] - Optional security configuration to protect the route.
   *                                     - `true`: Enables basic security. If no valid session is found, the user will be redirected to the URL specified in `secureConfig.redirect`.
   *                                     - `function`: Provides a custom checkpoint function for more complex authorization logic.
   *                                                   This function should conform to the same signature as the `checkpoint` function in the `secure()` method,
   *                                                   allowing for fine-grained control over route access based on session data and context.
   *                                     - `undefined` (or omitted): Disables security for this route. No session check or security enforcement will be applied.
   * @returns {GetServerSideProps<T>} - Returns a Next.js `GetServerSideProps` function.
   *                                    This function encapsulates the server-side logic, session management, security checks, and error handling,
   *                                    and is ready to be exported from your Next.js page.
   *
   * @example
   * // Basic server-side props fetching without security
   * export const getServerSideProps = server.server(async ({ params: { session, p, api } }) => {
   *   const itemId = p('itemId');
   *   const item = await api.endpoint("V1_ITEM_SHOW").call({ itemId }); // Example API call using the provided api client
   *   return { props: { item } }; // Return fetched item as props
   * });
   *
   * @example
   * // Secure server-side props fetching, redirecting to login if no session
   * export const getServerSideProps = server.server(async ({ params: { session, p, api } }) => {
   *   const itemId = p('itemId');
   *   const item = await api.endpoint("V1_ITEM_SHOW").call({ itemId }); // Example API call
   *   return { props: { item } };
   * }, true); // Enable basic security - redirects to secureConfig.redirect if no session
   *
   * @example
   * // Server-side props fetching with custom security checkpoint based on user role
   * export const getServerSideProps = server.server(async ({ params: { session, p, api } }) => {
   *   const itemId = p('itemId');
   *   const item = await api.endpoint("V1_ITEM_SHOW").call({ itemId }); // Example API call
   *   return { props: { item } };
   * }, ({ session }) => { // Custom security checkpoint function
   *   return { allow: session?.role === 'admin', redirect: '/unauthorized' }; // Allow only admins, redirect unauthorized users
   * });
   */
  server = <T extends { [key: string]: any }>(
    callback: (params: {
      session: ROUTES[SCERK]['io']['output'] | null
      ctx: GetServerSidePropsContext
      params: (key: KEYS) => string
      api: Gate<ROUTES>
    }) => Promise<GetServerSidePropsResult<T>>,
    secure?:
      | ((params: {
          ctx: GetServerSidePropsContext
          session: ROUTES[SCERK]['io']['output'] | null
        }) => CheckpointParams)
      | true
  ): GetServerSideProps<T> => {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
      try {
        const session = await this.#session(ctx)

        if (secure) {
          if (typeof secure === 'function') {
            const condition = secure({ ctx, session })

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
