import { ApiDefinition, EndpointKeys } from '@folie/blueprint-lib'
import { Gate } from '@folie/gate'
import { NotificationFunction } from './types/index.js'
import { useRouter } from 'next/router.js'
import {
  getCookie as getCook,
  setCookie as setCook,
  deleteCookie as removeCook,
} from 'cookies-next'
import {
  UndefinedInitialDataOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useForm, UseFormInput } from '@mantine/form'
import { GateErrorHandler } from './api/gate_error_handler.js'
import { useDebouncedValue, useSetState } from '@mantine/hooks'
import { CobaltUseMutationParams } from './types/cobalt_hooks.js'
import { GetInputPropOptions, GetInputPropsReturnType } from './types/cobalt_hooks.js'

export class Cobalt<
  const Api extends ApiDefinition,
  COOKIEKEYS extends Record<string, string> = {},
  PARAMKEYS extends readonly [...string[]] = [],
> {
  api: Gate<Api>
  endpoints: Api

  notification: NotificationFunction

  cookieKeys: COOKIEKEYS
  paramKeys: PARAMKEYS

  constructor(params: {
    api: Gate<Api>
    routes: Api
    notification: NotificationFunction
    paramKeys: PARAMKEYS
    cookieKeys: COOKIEKEYS
  }) {
    this.api = params.api
    this.endpoints = params.routes
    this.notification = params.notification
    this.paramKeys = params.paramKeys
    this.cookieKeys = params.cookieKeys
  }

  useParams = () => {
    const router = useRouter()

    return {
      isReady: router.isReady,
      param: (key: PARAMKEYS[number]) => {
        if (!router.isReady) {
          return ''
        }

        const value = router.query[key]

        if (typeof value !== 'string') {
          return ''
        }

        return value
      },
    }
  }

  getCookie = (key: keyof COOKIEKEYS) => {
    const cook = getCook(this.cookieKeys[key])

    if (typeof cook !== 'string') {
      return null
    }

    return cook
  }

  removeCookie = (key: keyof COOKIEKEYS) => removeCook(this.cookieKeys[key])

  setCookie = (key: keyof COOKIEKEYS, value: string) => {
    setCook(this.cookieKeys[key], value)
  }

  queryKey = <EK extends EndpointKeys<Api>, EP extends Api[EK]['io']>(params: {
    endpoint: EK
    params: NonNullable<EP['input']>['params']
    query?: NonNullable<EP['input']>['query']
  }) => {
    const endpoint = this.endpoints[params.endpoint]

    const result: any[] = [endpoint.method, endpoint.path(params.params)]

    if (params.query) {
      result.push(params.query)
    }

    return result
  }

  useQuery = <EK extends EndpointKeys<Api>, EP extends Api[EK]['io']>(
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
        params: input?.params,
        query: input?.query,
      }),
      queryFn: () => this.api.endpoint(endpoint).call(input),
    })

    return internalQuery
  }

  useMutation = <EK extends EndpointKeys<Api>, EP extends Api[EK]['io']>(
    params: CobaltUseMutationParams<Api, EK, EP>
  ) => {
    const { endpoint, form, onSuccess, onError, ...rest } = params

    const queryClient = useQueryClient()

    const internalMutation = useMutation({
      // Temporary
      ...rest,

      // Permanent
      mutationFn: this.api.endpoint(params.endpoint).call,

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
          GateErrorHandler({ error, form: params.form, notification: this.notification })
        }

        if (params.onErrorHook?.after) {
          params.onErrorHook.after()
        }
      },
    })

    return internalMutation
  }

  useList = <EK extends EndpointKeys<Api>, EP extends Api[EK]['io']>(
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

  useForm = <EK extends EndpointKeys<Api>, EP extends Api[EK]['io']>(
    params: UseFormInput<NonNullable<EP['input']>> & {
      endpoint: EK

      onSuccess: CobaltUseMutationParams<Api, EK, EP>['onSuccess']

      mutation?: Omit<CobaltUseMutationParams<Api, EK, EP>, 'form' | 'onSuccess' | 'endpoint'>
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
          ? options.disabled(internalForm.values[key])
          : internalMutation.isPending,
      }

      return base
    }

    return [internalForm, internalMutation, getExtendedInputProps] as const
  }
}
