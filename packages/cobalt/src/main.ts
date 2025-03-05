import { useList, UseListParams } from './hooks/use_list.js'
import { useForm, UseFormParams } from './hooks/use_form.js'
import { RouteKeys, Routes } from '@folie/blueprint-lib'
import { Gate } from '@folie/gate'
import { NotificationFunction, SetPartialState } from './types/index.js'
import { useRouter } from 'next/router.js'
import {
  getCookie as getCook,
  setCookie as setCook,
  deleteCookie as removeCook,
} from 'cookies-next'
import {
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  useQuery as useTanQuery,
  useMutation as useTanMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { UseFormReturnType } from '@mantine/form'
import { GateErrorHandler } from './api/gate_error_handler.js'
import { useDebouncedValue, useSetState } from '@mantine/hooks'

export class Cobalt<
  ROUTES extends Routes,
  COOKIEKEYS extends Record<string, string> = {},
  PARAMKEYS extends readonly [...string[]] = [],
> {
  api: Gate<ROUTES>
  routes: ROUTES
  notification: NotificationFunction

  cookieKeys: COOKIEKEYS
  paramKeys: PARAMKEYS

  constructor(params: {
    api: Gate<ROUTES>
    routes: ROUTES
    notification: NotificationFunction
    paramKeys: PARAMKEYS
    cookieKeys: COOKIEKEYS
  }) {
    this.api = params.api
    this.routes = params.routes
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
    this.removeCookie(key)

    setCook(this.cookieKeys[key], value)
  }

  queryKey = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(params: {
    endpoint: RK
    params: EP['input'] extends { params: any } ? EP['input']['params'] : undefined
    query?: EP['input'] extends { query: any } ? EP['input']['query'] : undefined
  }) => {
    const endpoint = this.routes[params.endpoint]

    const result: any[] = [endpoint.method, endpoint.path(params.params as never)]

    if (params.query) {
      result.push(params.query)
    }

    return result
  }

  useQuery = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    params: {
      endpoint: RK
      input: EP['input']
    } & Omit<UndefinedInitialDataOptions<EP['input'], Error, EP['output']>, 'queryFn' | 'queryKey'>
  ) => {
    const { endpoint, input, ...rest } = params

    const internalQuery = useTanQuery({
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

  useMutation = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    params: Omit<
      UseMutationOptions<EP['output'], unknown, EP['input'], unknown>,
      'mutationFn' | 'onSuccess' | 'onError'
    > & {
      endpoint: RK
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
  ) => {
    const { endpoint, form, onSuccess, onErr, ...rest } = params

    const queryClient = useQueryClient()

    const internalMutation = useTanMutation({
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
        GateErrorHandler({ error, form: params.form, notification: this.notification })

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

  useList = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    params: {
      endpoint: RK
      input: EP['input']
      debounce?: number
      leading?: boolean
    } & Omit<UndefinedInitialDataOptions<EP['input'], Error, EP['output']>, 'queryFn' | 'queryKey'>
  ) => {
    const { endpoint, input, debounce, leading, ...rest } = params

    const [internalBody, setInternalBody] = useSetState(input as Record<string, any>)

    const [debouncedBody] = useDebouncedValue(internalBody, debounce || 200, {
      leading: leading || true,
    })

    const internalQueryCall = this.useQuery({
      endpoint: params.endpoint,
      input: debouncedBody,
      ...rest,
    })

    return [
      internalQueryCall,
      [
        internalBody as EP['input'],
        setInternalBody as unknown as SetPartialState<NonNullable<EP['input']>>,
      ],
    ] as const
  }

  useForm = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    params: UseFormParams<ROUTES, RK, EP>
  ) => useForm<false, ROUTES, RK, EP>(this, params)
}
