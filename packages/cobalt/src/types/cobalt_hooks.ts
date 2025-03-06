import { UseFormReturnType } from '@mantine/form'
import { QueryKey, UseMutationOptions } from '@tanstack/react-query'
import type { Cobalt } from '../main.js'
import { ApiDefinition, EndpointKeys } from '@folie/blueprint-lib'

export type CobaltUseMutationParams<
  Api extends ApiDefinition,
  EK extends EndpointKeys<Api>,
  EP extends Api[EK]['io'],
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
    queryKeys?: (qk: Cobalt<Api>['queryKey']) => QueryKey[]
    after?: () => void
  } | void

  form?: UseFormReturnType<NonNullable<EP['input']>>

  onError?: (params: {
    error: unknown
    input: EP['input']
    form?: UseFormReturnType<NonNullable<EP['input']>>
    notification: Cobalt<Api>['notification']
  }) => void

  onErrorHook?: {
    after?: () => void
  }
}

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
