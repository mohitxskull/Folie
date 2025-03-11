import { interpolate } from '@folie/lib'
import { Endpoint, EndpointIO } from './types.js'
import qs from 'qs'

export const endpoint = <IO extends EndpointIO>(params: {
  url: string
  method: string
  form: boolean
}): Endpoint<IO> =>
  ({
    url: (options?) => {
      let url = interpolate(params.url, options?.params)

      if (options?.query) {
        url += `?${qs.stringify(options.query)}`
      }

      return url
    },
    method: params.method,
    form: params.form,
    io: {} as IO,
  }) as const
