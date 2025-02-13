import Session from '#models/session'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options?: { bypass?: true }) {
    try {
      const [user, accessToken] = await Session.$.authenticate(ctx)

      ctx.session = {
        ...ctx.session,
        user,
        accessToken,
      }

      return next()
    } catch (error) {
      if (options?.bypass === true) {
        return next()
      }

      throw error
    }
  }
}
