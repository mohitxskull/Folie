import { interpolate } from '@folie/lib'
import { Endpoint, EndpointIO } from './types.js'

export const route = <IO extends EndpointIO>(params: {
  path: string
  method: string
  form: boolean
}): Endpoint<IO> =>
  ({
    path: (p) => interpolate(params.path, p),
    method: params.method,
    form: params.form,
    io: {} as IO,
  }) as const
