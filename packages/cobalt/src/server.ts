import { Gate } from '@folie/gate'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { NextServerError } from './helpers/next_server_error.js'
import { CheckpointParams } from './types/server.js'
// eslint-disable-next-line import/extensions
import { deleteCookie } from 'cookies-next/server'
import { ApiDefinition, EndpointKeys } from '@folie/blueprint-lib'

export class CobaltServer<Api extends ApiDefinition, EK extends EndpointKeys<Api>> {
  api: Gate<Api>
  endpoints: Api

  sessionConfig: {
    cookie: string
    endpoint: EK
  }

  checkpointConfig: {
    redirect: string
  }

  constructor(params: {
    api: Gate<Api>
    endpoints: Api
    session: {
      /** Cookie name used for session */
      cookie: string
      endpoint: EK
    }
    checkpoint: {
      redirect: string
    }
  }) {
    this.api = params.api
    this.endpoints = params.endpoints

    this.sessionConfig = params.session
    this.checkpointConfig = params.checkpoint
  }

  #session = async (ctx: GetServerSidePropsContext): Promise<Api[EK]['io']['output'] | null> => {
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
      session: Api[EK]['io']['output'] | null
    }) => CheckpointParams
  }): GetServerSideProps<{
    session: Api[EK]['io']['output'] | null
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
      session: Api[EK]['io']['output'] | null
      ctx: GetServerSidePropsContext
      api: Gate<Api>
    }) => Promise<GetServerSidePropsResult<T>>,
    options?: {
      checkpointCondition?:
        | ((params: {
            ctx: GetServerSidePropsContext
            session: Api[EK]['io']['output'] | null
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

        if (options?.checkpointCondition) {
          if (typeof options?.checkpointCondition === 'function') {
            const condition = options?.checkpointCondition({ ctx, session })

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
