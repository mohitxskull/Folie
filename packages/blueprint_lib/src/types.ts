import { VineValidator } from '@vinejs/vine'
import { InferInput } from '@vinejs/vine/types'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import { Constructor } from '@adonisjs/core/types/container'

export type EndpointIO = {
  output: Record<string, any>
  input?: {
    params?: Record<string, any>
    query?: Record<string, any>
    headers?: Record<string, any>
    cookies?: Record<string, any>
    [key: string]: any // Allow for other input properties
  }
}

export type Endpoint<IO extends EndpointIO> = {
  url: (options?: {
    params?: NonNullable<IO['input']>['params']
    query?: NonNullable<IO['input']>['query']
  }) => string
  method: string
  form?: boolean
  io: IO
}

export type ApiEndpoints = Record<string, Endpoint<any>>

export type EndpointKeys<ROUTES extends ApiEndpoints> = keyof ROUTES

// ===============
// https://github.com/Julien-R44/tuyau/blob/main/packages/utils/src/types.ts

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type UndefinedProps<T extends object> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K]
}

export type MakeOptional<T extends object> = UndefinedProps<T> & Omit<T, keyof UndefinedProps<T>>

export type FileMapping<T extends object> = MakeOptional<{
  [K in keyof T]: T[K] extends MultipartFile ? Blob | File : T[K]
}>

export type InferController<CONTROLLER extends Constructor<{ [key: string]: any }>> = {
  output: 'handle' extends keyof InstanceType<CONTROLLER>
    ? ReturnType<InstanceType<CONTROLLER>['handle']> extends Promise<infer U>
      ? U extends object
        ? Prettify<U>
        : undefined
      : undefined
    : undefined

  input: 'input' extends keyof InstanceType<CONTROLLER>
    ? InstanceType<CONTROLLER>['input'] extends VineValidator<any, any>
      ? InferInput<InstanceType<CONTROLLER>['input']> extends object
        ? Prettify<FileMapping<InferInput<InstanceType<CONTROLLER>['input']>>>
        : undefined
      : undefined
    : undefined
}
