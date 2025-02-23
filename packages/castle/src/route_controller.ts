/// <reference types="@adonisjs/core/providers/vinejs_provider" />

import { HttpContext } from '@adonisjs/core/http'
import { VineValidator } from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'
import { Constructor } from '@adonisjs/core/types/container'

export const routeController = <OUT, IN extends VineValidator<any, any>>(params: {
  input?: IN
  handle: (params: {
    ctx: HttpContext
    payload: IN extends VineValidator<any, any> ? Infer<IN> : never
  }) => Promise<OUT>
}): Constructor<{
  input?: IN
  handle(ctx: HttpContext): Promise<OUT>
}> => {
  return class {
    input?: IN = params.input

    async handle(ctx: HttpContext) {
      const payload = this.input ? await ctx.request.validateUsing(this.input) : undefined

      return params.handle({ ctx, payload })
    }
  }
}
