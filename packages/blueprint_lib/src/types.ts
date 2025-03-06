import { VineValidator } from '@vinejs/vine'
import { InferInput } from '@vinejs/vine/types'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import { Constructor } from '@adonisjs/core/types/container'
import { HttpContext } from '@adonisjs/core/http'

export type EndpointIO = {
  output: { [key: string]: any }
  input?: {
    params?: { [key: string]: any }
    query?: { [key: string]: any }
    headers?: { [key: string]: any }
    cookies?: { [key: string]: any }
    [key: string]: any
  }
}

export type Endpoint<IO extends EndpointIO> = {
  path: (params: NonNullable<IO['input']>['params']) => string
  method: string
  form?: boolean
  io: IO
}

export type ApiDefinition = Record<string, Endpoint<EndpointIO>>

export type EndpointKeys<ROUTES extends ApiDefinition> = keyof ROUTES

// ===============
// https://github.com/Julien-R44/tuyau/blob/main/packages/utils/src/types.ts

type JsonPrimitive = string | number | boolean | string | number | boolean | null

type NonJsonPrimitive = undefined | Function | symbol

type IsAny<T> = 0 extends 1 & T ? true : false

type SerializeTuple<T extends [unknown, ...unknown[]]> = {
  [k in keyof T]: T[k] extends NonJsonPrimitive ? null : Serialize<T[k]>
}

type SerializeObject<T extends object> = {
  [k in keyof Omit<T, FilterKeys<T, NonJsonPrimitive>>]: Serialize<T[k]>
}

type FilterKeys<TObj extends object, TFilter> = {
  [TKey in keyof TObj]: TObj[TKey] extends TFilter ? TKey : never
}[keyof TObj]

export type Serialize<T> =
  IsAny<T> extends true
    ? any
    : T extends JsonPrimitive | undefined
      ? T
      : T extends Map<any, any> | Set<any>
        ? Record<string, never>
        : T extends NonJsonPrimitive
          ? never
          : T extends { toJSON(): infer U }
            ? U
            : T extends []
              ? []
              : T extends [unknown, ...unknown[]]
                ? SerializeTuple<T>
                : T extends ReadonlyArray<infer U>
                  ? (U extends NonJsonPrimitive ? null : Serialize<U>)[]
                  : T extends object
                    ? T extends { [key: string]: JsonPrimitive }
                      ? T
                      : SerializeObject<T>
                    : never

type UndefinedProps<T extends object> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K]
}

export type MakeOptional<T extends object> = UndefinedProps<T> & Omit<T, keyof UndefinedProps<T>>

export type FileMapping<T extends object> = MakeOptional<{
  [K in keyof T]: T[K] extends MultipartFile ? Blob | File : T[K]
}>

export type InferController<
  CONTROLLER extends Constructor<{
    handle: (ctx: HttpContext) => Promise<any>
    [key: string]: any
  }>,
> = {
  output: Awaited<ReturnType<InstanceType<CONTROLLER>['handle']>> extends object
    ? Serialize<Awaited<ReturnType<InstanceType<CONTROLLER>['handle']>>>
    : never

  input: NonNullable<InstanceType<CONTROLLER>['input']> extends VineValidator<any, any>
    ? InferInput<NonNullable<InstanceType<CONTROLLER>['input']>> extends object
      ? FileMapping<InferInput<NonNullable<InstanceType<CONTROLLER>['input']>>>
      : never
    : never
}
