import { QueryKey } from '@tanstack/react-query'
import type { Cobalt } from '../main.js'
import { RouteKeys, Routes } from '@folie/blueprint-lib'

export type QueryKeyParams<
  ROUTES extends Routes,
  RK extends RouteKeys<ROUTES>,
  EP extends ROUTES[RK]['io'],
> = {
  endpoint: RK

  params: EP['input'] extends { params: any } ? EP['input']['params'] : undefined
  query?: EP['input'] extends { query: any } ? EP['input']['query'] : undefined
}

export const queryKey = <
  ROUTES extends Routes,
  RK extends RouteKeys<ROUTES>,
  EP extends ROUTES[RK]['io'],
>(
  cobalt: Cobalt<ROUTES>,
  params: QueryKeyParams<ROUTES, RK, EP>
): QueryKey => {
  const endpoint = cobalt.routes[params.endpoint]

  const result: any[] = [endpoint.method, endpoint.path(params.params as never)]

  if (params.query) {
    result.push(params.query)
  }

  return result
}
