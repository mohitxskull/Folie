import { captcha } from '#config/captcha'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import ProcessingException from '@folie/castle/exception/processing_exception'
import vine from '@vinejs/vine'

const schema = vine.compile(
  vine.object({
    headers: vine.object({
      token: vine.string().maxLength(2048).minLength(10),
    }),
  })
)

export default class CaptchaMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (env.get('NODE_ENV') === 'test') {
      return next()
    }

    const payload = await ctx.request.validateUsing(schema)

    const [isValid] = await captcha.verify({ token: payload.headers.token, ip: ctx.request.ip() })

    if (!isValid) {
      throw new ProcessingException('Invalid captcha', {
        meta: {
          token: payload.headers.token,
          ip: ctx.request.ip(),
        },
      })
    }

    return next()
  }
}
