import { QueryClient } from '@tanstack/react-query'
import { useQuery, UseQueryParams } from './hooks/use_query.js'
import { useMutation, UseMutationParams } from './hooks/use_mutation.js'
import { useList, UseListParams } from './hooks/use_list.js'
import { useForm, UseFormParams } from './hooks/use_form.js'
import { queryKey, QueryKeyParams } from './helpers/query_key.js'
import { useParams } from './hooks/use_params.js'
import { RouteKeys, Routes } from '@folie/blueprint-lib'
import { Gate } from '@folie/gate'
import { NotificationFunction } from './types/index.js'

export class Cobalt<ROUTES extends Routes, KEYS extends string = never> {
  api: Gate<ROUTES>
  query: QueryClient
  routes: ROUTES
  notification: NotificationFunction

  constructor(params: {
    api: Gate<ROUTES>
    query: QueryClient
    routes: ROUTES
    notification: NotificationFunction
  }) {
    this.api = params.api
    this.query = params.query
    this.routes = params.routes
    this.notification = params.notification
  }

  // IMPROVE: Make reusable
  useParams = () => useParams<KEYS>()

  queryKey = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    endpoint: QueryKeyParams<ROUTES, RK, EP>['endpoint'],
    params: QueryKeyParams<ROUTES, RK, EP>['params'],
    query?: QueryKeyParams<ROUTES, RK, EP>['query']
  ) =>
    queryKey(this, {
      endpoint,
      params,
      query,
    })

  useQuery = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    params: UseQueryParams<ROUTES, RK, EP>
  ) => useQuery(this, params)

  useMutation = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    params: UseMutationParams<ROUTES, RK, EP>
  ) => useMutation(this, params)

  useList = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    params: UseListParams<ROUTES, RK, EP>
  ) => useList(this, params)

  useForm = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    params: UseFormParams<ROUTES, RK, EP>
  ) => useForm<false, ROUTES, RK, EP>(this, params)

  useFormP = <RK extends RouteKeys<ROUTES>, EP extends ROUTES[RK]['io']>(
    params: UseFormParams<ROUTES, RK, EP>
  ) => useForm<true, ROUTES, RK, EP>(this, params)
}
