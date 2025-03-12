// eslint-disable-next-line import/extensions
import { deleteCookie } from 'cookies-next/server'
import { Gate } from '@folie/gate'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { ApiEndpoints, EndpointKeys } from '@folie/blueprint-lib'
import { CheckpointParams } from './types.js'
import { NextServerError } from './next_server_error.js'

export class GateNextServer<
  const Endpoints extends ApiEndpoints,
  SessionEndpointKey extends EndpointKeys<Endpoints>,
> {
  api: Gate<Endpoints>
  endpoints: Endpoints

  sessionConfig: {
    cookie: string
    endpoint: SessionEndpointKey
  }

  checkpointConfig: {
    redirect: string
  }

  constructor(params: {
    gate: Gate<Endpoints>
    endpoints: Endpoints
    session: {
      /** Cookie name used for session */
      cookie: string
      endpoint: SessionEndpointKey
    }
    checkpoint: {
      redirect: string
    }
  }) {
    this.api = params.gate
    this.endpoints = params.endpoints

    this.sessionConfig = params.session
    this.checkpointConfig = params.checkpoint
  }

  #session = async (
    ctx: GetServerSidePropsContext
  ): Promise<Endpoints[SessionEndpointKey]['io']['output'] | null> => {
    const sessionCookie = ctx.req.cookies[this.sessionConfig.cookie]

    if (!sessionCookie) {
      return null
    }

    this.api.setToken(sessionCookie)

    const [res] = await this.api.endpoint(this.sessionConfig.endpoint).safeCall(undefined)

    return res
  }

  checkpoint = (params?: {
    condition?: (params: {
      ctx: GetServerSidePropsContext
      session: Endpoints[SessionEndpointKey]['io']['output'] | null
    }) => CheckpointParams
  }): GetServerSideProps<{
    session: Endpoints[SessionEndpointKey]['io']['output'] | null
  }> => {
    return async (ctx: GetServerSidePropsContext) => {
      const session = await this.#session(ctx)

      if (!session) {
        deleteCookie(this.sessionConfig.cookie, ctx)
      }

      const condition = params?.condition
        ? params.condition({ ctx, session })
        : { allow: session !== null, redirect: this.checkpointConfig.redirect }

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
      session: Endpoints[SessionEndpointKey]['io']['output'] | null
      ctx: GetServerSidePropsContext
      api: Gate<Endpoints>
    }) => Promise<GetServerSidePropsResult<T>>,
    options?: {
      checkpoint?:
        | ((params: {
            ctx: GetServerSidePropsContext
            session: Endpoints[SessionEndpointKey]['io']['output'] | null
          }) => CheckpointParams)
        | true
    }
  ): GetServerSideProps<T> => {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
      try {
        const session = await this.#session(ctx)

        if (!session) {
          deleteCookie(this.sessionConfig.cookie, ctx)
        }

        if (options?.checkpoint) {
          if (typeof options?.checkpoint === 'function') {
            const condition = options?.checkpoint({ ctx, session })

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
                  destination: this.checkpointConfig.redirect,
                  permanent: false,
                },
              }
            }
          }
        }

        const res = await callback({ session, ctx, api: this.api })

        return res
      } catch (error) {
        const e = NextServerError.fromError(error)

        e.report()

        return e.handle<T>()
      }
    }
  }
}
