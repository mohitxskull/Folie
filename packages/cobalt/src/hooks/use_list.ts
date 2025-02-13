import { useDebouncedValue, useSetState } from '@mantine/hooks'
import type { Cobalt } from '../main.js'
import { UseQueryParams } from './use_query.js'
import { SetPartialState } from '../types/form.js'
import { RouteKeys, Routes } from '@folie/blueprint-lib'

export type UseListParams<
  ROUTES extends Routes,
  RK extends RouteKeys<ROUTES>,
  EP extends ROUTES[RK]['io'],
> = {
  endpoint: RK

  input: EP['input']

  props?: UseQueryParams<ROUTES, RK, EP>['props']

  debounce?: number
}

export const useList = <
  ROUTES extends Routes,
  RK extends RouteKeys<ROUTES>,
  EP extends ROUTES[RK]['io'],
>(
  cobalt: Cobalt<ROUTES>,
  params: UseListParams<ROUTES, RK, EP>
) => {
  const [internalBody, setInternalBody] = useSetState(params.input as Record<string, any>)

  const [debouncedBody] = useDebouncedValue(internalBody, params.debounce || 200)

  const internalQueryCall = cobalt.useQuery({
    endpoint: params.endpoint,
    input: debouncedBody,
    props: params.props,
  })

  return [
    internalQueryCall,
    [
      internalBody as EP['input'],
      setInternalBody as unknown as SetPartialState<NonNullable<EP['input']>>,
    ],
  ] as const
}
