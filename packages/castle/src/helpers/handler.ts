/// <reference types="@adonisjs/core/providers/vinejs_provider" />

import { HttpContext } from '@adonisjs/core/http'

export const handler = <OUT extends { message?: string; [key: string]: any }>(
  logic: (params: {
    ctx: HttpContext
    getPayload: HttpContext['request']['validateUsing']
  }) => Promise<OUT>
) => {
  return async (ctx: HttpContext) => {
    return logic({ ctx, getPayload: ctx.request.validateUsing })
  }
}
