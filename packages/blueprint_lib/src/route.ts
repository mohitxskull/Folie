import { interpolate } from '@folie/lib'
import { Endpoint, EndpointIO } from './types.js'

const parser = <PARAMS>(path: string, params: PARAMS) => interpolate(path, params)

export const route = <IO extends EndpointIO>(params: {
  path: string
  method: string
  form: boolean
}): Endpoint<IO> =>
  ({
    path: (p) => parser(params.path, p),
    method: params.method,
    form: params.form,
    io: {} as IO,
  }) as const
