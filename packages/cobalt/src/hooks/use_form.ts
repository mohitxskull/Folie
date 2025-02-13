import { useForm as useManForm, UseFormInput, UseFormReturnType } from '@mantine/form'
import type { Cobalt } from '../main.js'
import { UseMutationParams } from './use_mutation.js'
import type { GetInputPropOptions, GetInputPropsReturnType } from '../types/form.js'
import { Paths } from '../types/object_path.js'
import { RouteKeys, Routes } from '@folie/blueprint-lib'

export type UseFormParams<
  ROUTES extends Routes,
  RK extends RouteKeys<ROUTES>,
  EP extends ROUTES[RK]['io'],
> = {
  endpoint: RK

  onSuccess: UseMutationParams<ROUTES, RK, EP>['onSuccess']

  form: {
    values: NonNullable<UseFormInput<EP['input']>['initialValues']>
    onValuesChange?: UseFormInput<EP['input']>['onValuesChange']
    transform?: UseFormInput<EP['input']>['transformValues']
  }

  mutation?: {
    props?: UseMutationParams<ROUTES, RK, EP>['props']
    onErr?: UseMutationParams<ROUTES, RK, EP>['onErr']
  }
}

export const useForm = <
  PATHS extends boolean,
  ROUTES extends Routes,
  RK extends RouteKeys<ROUTES>,
  EP extends ROUTES[RK]['io'],
>(
  cobalt: Cobalt<ROUTES>,
  params: UseFormParams<ROUTES, RK, EP>
) => {
  const internalForm = useManForm({
    mode: 'uncontrolled',
    initialValues: params.form.values,
    onValuesChange: params.form.onValuesChange,
    transformValues: params.form.transform,
  })

  const internalMutation = cobalt.useMutation({
    endpoint: params.endpoint,
    onSuccess: params.onSuccess,
    form: internalForm as UseFormReturnType<EP['input']>,
    props: params.mutation?.props,
    onErr: params.mutation?.onErr,
  })

  const getExtendedInputProps = (
    key: PATHS extends true ? Paths<EP['input']> : string[],
    options?: GetInputPropOptions<EP['input']>
  ): GetInputPropsReturnType<EP['input']> => {
    const source = key.join('.')

    const base = {
      ...internalForm.getInputProps(source, {
        type: options?.type,
        withError: options?.withError,
        withFocus: options?.withFocus,
      }),
      disabled: options?.disabled
        ? options.disabled(internalForm.values[source])
        : internalMutation[0].isPending,
    }

    return base
  }

  const getInputKey = (key: PATHS extends true ? Paths<EP['input']> : string[]) => {
    return internalForm.key(key.join('.'))
  }

  return [
    internalForm as unknown as UseFormReturnType<EP['input']>,
    getExtendedInputProps,
    getInputKey,
    internalMutation,
  ] as const
}
