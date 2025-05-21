import { UseFormReturnType } from '@mantine/form'
import { QueryKey, UseMutationOptions, UseMutationResult } from '@tanstack/react-query'
import { ApiEndpoints, EndpointKeys, EndpointIO } from '@folie/lib'
import type { GateTan } from './tan.js'
import type { GateCallOptions } from '@folie/gate/types'

export type NotificationFunction = (params: { title?: string; message: string }) => void

export type CobaltUseMutationParams<
  Endpoints extends ApiEndpoints,
  EK extends EndpointKeys<Endpoints>,
  EP extends Endpoints[EK]['io'],
> = Omit<
  UseMutationOptions<EP['output'], unknown, EP['input'], unknown>,
  'mutationFn' | 'onSuccess' | 'onError'
> & {
  endpoint: EK

  onSuccess: (
    output: EP['output'],
    input: EP['input']
  ) => {
    input?: EP['input']
    queryKeys?: (qk: GateTan<Endpoints>['queryKey']) => QueryKey[]
    after?: () => void
  } | void

  form?: UseFormReturnType<NonNullable<EP['input']>>

  onError?: (params: {
    error: unknown
    input: EP['input']
    form?: UseFormReturnType<NonNullable<EP['input']>>
    notification: GateTan<Endpoints>['notification']
  }) => void

  onErrorHook?: {
    after?: () => void
  }
} & GateCallOptions

export type FormInputTransformType = 'default'

export type GetInputPropOptions<Values> = NonNullable<
  Parameters<UseFormReturnType<Values>['getInputProps']>[1]
> & {
  // transform?: FormInputTransformType
  disabled?: (disabled: boolean) => boolean
}

export type GetInputPropsReturnType<Values> = ReturnType<
  UseFormReturnType<Values>['getInputProps']
> & {
  disabled: boolean
  [key: string]: any
}

export type SetPartialState<T extends Record<string, unknown>> = (
  statePartial: Partial<T> | ((currentState: T) => Partial<T>)
) => void

export type OnValuesChangeParams<T extends EndpointIO> = {
  values: NonNullable<T['input']>
  previousValues: NonNullable<T['input']>
  mutation: UseMutationResult<T['output'], unknown, T['input'], unknown>
}
