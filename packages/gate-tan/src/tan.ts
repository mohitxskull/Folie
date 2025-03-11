import { ApiEndpoints, EndpointKeys } from '@folie/blueprint-lib'
import { Gate } from '@folie/gate'
import {
  UndefinedInitialDataOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useForm, UseFormInput } from '@mantine/form'
import { useDebouncedValue, useSetState } from '@mantine/hooks'
import {
  CobaltUseMutationParams,
  GetInputPropOptions,
  GetInputPropsReturnType,
  NotificationFunction,
} from './types.js'
import { ErrorHandler } from './error_handler.js'

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

  queryKey = <EK extends EndpointKeys<Endpoints>, EP extends Endpoints[EK]['io']>(params: {
    endpoint: EK
    options?: {
      params?: NonNullable<EP['input']>['params']
      query?: NonNullable<EP['input']>['query']
    }
  }) => {
    const endpoint = this.endpoints[params.endpoint]

    return [endpoint.method, endpoint.url(params.options)]
  }

  useQuery = <EK extends EndpointKeys<Endpoints>, EP extends Endpoints[EK]['io']>(
    params: {
      endpoint: EK
      input: EP['input']
    } & Omit<UndefinedInitialDataOptions<EP['input'], Error, EP['output']>, 'queryFn' | 'queryKey'>
  ) => {
    const { endpoint, input, ...rest } = params

    const internalQuery = useQuery({
      // Temporary
      ...rest,

      // Permanent
      queryKey: this.queryKey({
        endpoint: endpoint,
        options: {
          params: input?.params,
          query: input?.query,
        },
      }),
      queryFn: () => this.gate.endpoint(endpoint).call(input),
    })

    return internalQuery
  }

  useMutation = <EK extends EndpointKeys<Endpoints>, EP extends Endpoints[EK]['io']>(
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
          params.form.resetDirty(res.input)
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

  useList = <EK extends EndpointKeys<Endpoints>, EP extends Endpoints[EK]['io']>(
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

    const [internalBody, setInternalBody] = useSetState<NonNullable<EP['input']>>(input ?? {})

    const [debouncedBody] = useDebouncedValue(internalBody, debounce?.timeout || 200, {
      leading: debounce?.leading || true,
    })

    const internalQueryCall = this.useQuery({
      ...rest,

      endpoint: params.endpoint,
      input: debouncedBody,
    })

    return [internalQueryCall, [internalBody, setInternalBody]] as const
  }

  useForm = <EK extends EndpointKeys<Endpoints>, EP extends Endpoints[EK]['io']>(
    params: UseFormInput<NonNullable<EP['input']>> & {
      endpoint: EK

      onSuccess: CobaltUseMutationParams<Endpoints, EK, EP>['onSuccess']

      mutation?: Omit<CobaltUseMutationParams<Endpoints, EK, EP>, 'form' | 'onSuccess' | 'endpoint'>
    }
  ) => {
    const { endpoint, onSuccess, mutation, ...rest } = params

    const internalForm = useForm<NonNullable<EP['input']>>({
      mode: 'uncontrolled',
      ...rest,
    })

    const internalMutation = this.useMutation({
      ...mutation,

      endpoint: params.endpoint,
      onSuccess: params.onSuccess,
      form: internalForm,
    })

    const getExtendedInputProps = (
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
    }

    return [internalForm, internalMutation, getExtendedInputProps] as const
  }
}
