import { HttpContext } from '@adonisjs/core/http'

export const getBearerToken = (ctx: HttpContext) => {
  return ctx.request.header('Authorization')?.replace('Bearer ', '')
}
