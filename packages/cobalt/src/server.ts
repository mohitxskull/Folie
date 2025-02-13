import { RouteKeys, Routes } from '@folie/blueprint-lib'
import { Gate } from '@folie/gate'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { createStringGetter } from './helpers/create_string_getter'
import { NextServerError } from './helpers/next_server_error'

export class CobaltServer<
  ROUTES extends Routes,
  SCERK extends RouteKeys<ROUTES>,
  KEYS extends string = never,
> {
  api: Gate<ROUTES>
  routes: ROUTES

  sessionConfig: {
    cookie: string
    endpoint: SCERK
  }

  secureConfig: {
    redirect: string
  }

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

  session = async (ctx: GetServerSidePropsContext) => {
    const sessionCookie = ctx.req.cookies[this.sessionConfig.cookie]

    if (!sessionCookie) {
      return null
    }

    this.api.setToken(sessionCookie)

    const [res] = await this.api.endpoint(this.sessionConfig.endpoint).safeCall(undefined)

    return res
  }

  secure = (params?: {
    checkpoint?: (params: {
      ctx: GetServerSidePropsContext
      session: ROUTES[SCERK]['io']['output'] | null
    }) =>
      | {
          allow: true
        }
      | {
          allow: false
          redirect: string
        }
  }) => {
    return async (ctx: GetServerSidePropsContext) => {
      const session = await this.session(ctx)

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

      return { props: {} }
    }
  }

  server = <T, CTX extends GetServerSidePropsContext>(
    callback: (params: {
      session: ROUTES[SCERK]['io']['output'] | null
      ctx: CTX
      params: (key: KEYS) => string
    }) => Promise<GetServerSidePropsResult<T>>
  ) => {
    return async (ctx: CTX): Promise<GetServerSidePropsResult<T>> => {
      try {
        const session = await this.session(ctx)

        const getter = createStringGetter<KEYS>(ctx.params ?? {})

        const params = (key: KEYS) => {
          const res = getter(key)

          if (!res) {
            throw new NextServerError({ type: '404' })
          }

          return res
        }

        const res = await callback({ session, ctx, params })

        return res
      } catch (error) {
        const e = NextServerError.fromError(error)

        e.report()

        return e.handle<T>()
      }
    }
  }
}
