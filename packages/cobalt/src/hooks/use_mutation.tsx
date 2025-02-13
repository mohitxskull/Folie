import { QueryKey, UseMutationOptions, useMutation as useTanMutation } from '@tanstack/react-query'
import { GateErrorHandler } from '../api/gate_error_handler.js'
import { UseFormReturnType } from '@mantine/form'
import type { Cobalt } from '../main.js'
import { RouteKeys, Routes } from '@folie/blueprint-lib'

export type UseMutationParams<
  ROUTES extends Routes,
  RK extends RouteKeys<ROUTES>,
  EP extends ROUTES[RK]['io'],
> = {
  endpoint: RK

  props?: Omit<
    UseMutationOptions<EP['output'], unknown, EP['input'], unknown>,
    'mutationFn' | 'onSuccess' | 'onError'
  >

  form?: UseFormReturnType<EP['input']>

  onSuccess: (
    output: EP['output'],
    input: EP['input']
  ) => {
    input?: EP['input']
    queryKeys?: (qk: Cobalt<ROUTES>['queryKey']) => QueryKey[]
    after?: () => void
  } | void

  onErr?: (error: unknown, input: EP['input']) => void
}

export const useMutation = <
  ROUTES extends Routes,
  RK extends RouteKeys<ROUTES>,
  EP extends ROUTES[RK]['io'],
>(
  cobalt: Cobalt<ROUTES>,
  params: UseMutationParams<ROUTES, RK, EP>
) => {
  const internalMutation = useTanMutation({
    // Temporary

    ...params.props,

    // Permanent
    mutationFn: cobalt.api.endpoint(params.endpoint).call,
    onSuccess: (output, input) => {
      const res = params.onSuccess(output, input)

      if (res?.queryKeys) {
        const queryKeys = res.queryKeys(cobalt.queryKey)

        for (const queryKey of queryKeys) {
          cobalt.query.invalidateQueries({
            queryKey,
            exact: true,
            type: 'active',
          })
        }
      }

      if (params.form && res?.input) {
        params.form.setValues(res.input)
        params.form.resetDirty(res.input)
      }

      if (res?.after) {
        res.after()
      }
    },
    onError: (error, variables) => {
      GateErrorHandler({ error, form: params.form, notification: cobalt.notification })

      if (params.onErr) {
        params.onErr(error, variables)
      }
    },
  })

  const mutate = (input: EP['input']) => {
    internalMutation.mutate(input)
  }

  return [internalMutation as Omit<typeof internalMutation, 'mutate'>, mutate] as const
}
