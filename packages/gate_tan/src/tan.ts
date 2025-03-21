import { ApiEndpoints } from '@folie/lib'
import { Gate } from '@folie/gate'
import {
  UndefinedInitialDataOptions,
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from '@tanstack/react-query'
import { useForm, UseFormInput } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import {
  CobaltUseMutationParams,
  GetInputPropOptions,
  GetInputPropsReturnType,
  NotificationFunction,
  OnValuesChangeParams,
} from './types.js'
import { ErrorHandler } from './error_handler.js'
import { useCallback, useRef, useState } from 'react'

export class GateTan<const Endpoints extends ApiEndpoints> {
  gate: Gate<Endpoints>
  endpoints: Endpoints

  notification: NotificationFunction

  constructor(params: {
    gate: Gate<Endpoints>
    endpoints: Endpoints
    notification: NotificationFunction
  }) {
    this.gate = params.gate
    this.endpoints = params.endpoints
    this.notification = params.notification
  }

  queryKey = <EK extends keyof Endpoints, EP extends Endpoints[EK]>(
    endpointKey: EK,
    options?: Parameters<EP['url']>[0]
  ) => {
    const endpoint = this.endpoints[endpointKey]

    return [endpoint.method, endpoint.url(options)]
  }

  useQuery = <EK extends keyof Endpoints, EP extends Endpoints[EK]['io']>(
    params: {
      endpoint: EK
      input?: EP['input']
    } & Omit<UndefinedInitialDataOptions<EP['input'], Error, EP['output']>, 'queryFn' | 'queryKey'>
  ) => {
    const { endpoint, input, ...rest } = params

    const internalQuery = useQuery({
      // Temporary
      ...rest,

      // Permanent
      queryKey: this.queryKey(endpoint, {
        params: input?.params,
        query: input?.query,
      }),
      queryFn: () => this.gate.endpoint(endpoint).call(input),
    })

    return internalQuery
  }

  useMutation = <EK extends keyof Endpoints, EP extends Endpoints[EK]['io']>(
    params: CobaltUseMutationParams<Endpoints, EK, EP>
  ) => {
    const { endpoint, form, onSuccess, onError, ...rest } = params

    const queryClient = useQueryClient()

    const internalMutation = useMutation({
      // Temporary
      ...rest,

      // Permanent
      mutationFn: this.gate.endpoint(params.endpoint).call,

      onSuccess: (output, input) => {
        const res = params.onSuccess(output, input)

        if (res?.queryKeys) {
          const queryKeys = res.queryKeys(this.queryKey)

          for (const queryKey of queryKeys) {
            queryClient.invalidateQueries({
              queryKey,
              exact: true,
              type: 'active',
            })
          }
        }

        if (params.form && res?.input) {
          params.form.setValues(res.input)
          params.form.resetDirty()
        }

        if (res?.after) {
          res.after()
        }
      },
      onError: (error, variables) => {
        if (onError) {
          onError({ error, input: variables, form: params.form, notification: this.notification })
        } else {
          ErrorHandler({ error, form: params.form, notification: this.notification })
        }

        if (params.onErrorHook?.after) {
          params.onErrorHook.after()
        }
      },
    })

    return internalMutation
  }

  useList = <EK extends keyof Endpoints, EP extends Endpoints[EK]['io']>(
    params: {
      endpoint: EK
      input?: EP['input']
      debounce?: {
        timeout?: number
        leading?: boolean
      }
    } & Omit<UndefinedInitialDataOptions<EP['input'], Error, EP['output']>, 'queryFn' | 'queryKey'>
  ) => {
    const { endpoint, input, debounce, ...rest } = params

    const [internalBody, setInternalBody] = useState<NonNullable<EP['input']>>(input ?? {})

    const [debouncedBody] = useDebouncedValue(internalBody, debounce?.timeout || 1000, {
      leading: debounce?.leading || false,
    })

    const internalQueryCall = this.useQuery({
      ...rest,

      endpoint: params.endpoint,
      input: debouncedBody,
    })

    return {
      query: internalQueryCall,
      debouncedBody: debouncedBody,
      body: internalBody,
      setBody: setInternalBody,
    }
  }

  useForm = <EK extends keyof Endpoints, EP extends Endpoints[EK]['io']>(
    params: Omit<UseFormInput<NonNullable<EP['input']>>, 'onValuesChange'> & {
      endpoint: EK

      onSuccess: CobaltUseMutationParams<Endpoints, EK, EP>['onSuccess']

      mutation?: Omit<CobaltUseMutationParams<Endpoints, EK, EP>, 'form' | 'onSuccess' | 'endpoint'>

      onValuesChange?: (params: OnValuesChangeParams<EP>) => void
    }
  ) => {
    const { endpoint, onSuccess, mutation, onValuesChange, ...rest } = params

    const mutationRef = useRef<UseMutationResult<
      EP['output'],
      unknown,
      EP['input'],
      unknown
    > | null>(null)

    const internalForm = useForm<NonNullable<EP['input']>>({
      mode: 'uncontrolled',
      onValuesChange: onValuesChange
        ? (values, previousValues) => {
            if (mutationRef.current) {
              onValuesChange({
                values,
                previousValues,
                mutation: mutationRef.current,
              })
            }
          }
        : undefined,
      ...rest,
    })

    const internalMutation = this.useMutation({
      ...mutation,

      endpoint: params.endpoint,
      onSuccess: params.onSuccess,
      form: internalForm,
    })

    mutationRef.current = internalMutation

    const getExtendedInputProps = useCallback(
      (
        key: string,
        options?: GetInputPropOptions<EP['input']>
      ): GetInputPropsReturnType<EP['input']> => {
        const base = {
          ...internalForm.getInputProps(key, {
            type: options?.type,
            withError: options?.withError,
            withFocus: options?.withFocus,
          }),
          disabled: options?.disabled
            ? options.disabled(internalMutation.isPending)
            : internalMutation.isPending,
        }

        return base
      },
      [internalForm, internalMutation.isPending]
    )

    return {
      form: internalForm,
      mutation: internalMutation,
      inputProps: getExtendedInputProps,
    } as const
  }
}
