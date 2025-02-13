import { VineValidator } from '@vinejs/vine'
import { InferInput } from '@vinejs/vine/types'
import type { MultipartFile } from '@adonisjs/bodyparser/types'

type IsNever<Type> = [Type] extends [never] ? undefined : Type

export type EndpointIO = {
  output: any
  input?: {
    params?: any
    query?: any
    [key: string]: any
  }
}

export type Endpoint<IO extends EndpointIO> = {
  path: (params?: IO['input'] extends { params: any } ? IO['input']['params'] : never) => string
  method: string
  form?: boolean
  io: IO
}

export type Routes = Record<string, Endpoint<EndpointIO>>

export type RouteKeys<ROUTES extends Routes> = keyof ROUTES

export type EndpointRouteKey<ROUTES extends Routes, RK extends RouteKeys<ROUTES>> = ROUTES[RK]

type UndefinedProps<T extends object> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K]
}

export type MakeOptional<T extends object> = UndefinedProps<T> & Omit<T, keyof UndefinedProps<T>>

/**
 * Shortcut for computing the Tuyau request type
 *
 * Also Remap MultipartFile to Blob | File | ReactNativeFile
 */
export type FileMapping<T extends object> = MakeOptional<{
  [K in keyof T]: T[K] extends MultipartFile ? Blob | File : T[K]
}>

export type InferController<
  CONTROLLER extends abstract new (...args: any) => {
    handle: (...args: any) => any
    input?: VineValidator<any, any>
  },
> = {
  output: IsNever<
    Awaited<ReturnType<InstanceType<CONTROLLER>['handle']>> extends object
      ? Awaited<ReturnType<InstanceType<CONTROLLER>['handle']>>
      : never
  >
  input: IsNever<
    InstanceType<CONTROLLER>['input'] extends VineValidator<any, any>
      ? InferInput<InstanceType<CONTROLLER>['input']> extends object
        ? FileMapping<InferInput<InstanceType<CONTROLLER>['input']>>
        : never
      : never
  >
}
