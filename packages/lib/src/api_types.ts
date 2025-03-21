export type EndpointIO = {
  output: any
  input: any
}

export type Endpoint<IO extends EndpointIO> = {
  url: (options?: {
    params?: 'input' extends keyof IO
      ? 'params' extends keyof IO['input']
        ? IO['input']['params']
        : undefined
      : undefined
    query?: 'input' extends keyof IO
      ? 'query' extends keyof IO['input']
        ? IO['input']['query']
        : undefined
      : undefined
  }) => string
  method: string
  form?: boolean
  io: IO
}

export type ApiEndpoints = Record<string, Endpoint<EndpointIO>>

export type EndpointKeys<Endpoints extends ApiEndpoints> = keyof Endpoints
