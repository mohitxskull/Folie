import type { VineValidator } from '@vinejs/vine'
import type { InferInput } from '@vinejs/vine/types'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import { Constructor } from '@adonisjs/core/types/container'
import type { SimplifyDeep, SetOptional } from 'type-fest'

type KeysWithUndefined<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T]

export type MakeOptional<T extends object> = SetOptional<T, KeysWithUndefined<T>>

export type FileMapping<T extends object> = MakeOptional<{
  [K in keyof T]: T[K] extends MultipartFile ? Blob | File : T[K]
}>

export type InferController<CONTROLLER extends Constructor<{ [key: string]: any }>> = {
  output: 'handle' extends keyof InstanceType<CONTROLLER>
    ? ReturnType<InstanceType<CONTROLLER>['handle']> extends Promise<infer U>
      ? U extends object
        ? SimplifyDeep<U>
        : undefined
      : undefined
    : undefined

  input: 'input' extends keyof InstanceType<CONTROLLER>
    ? InstanceType<CONTROLLER>['input'] extends VineValidator<any, any>
      ? InferInput<InstanceType<CONTROLLER>['input']> extends object
        ? SimplifyDeep<FileMapping<InferInput<InstanceType<CONTROLLER>['input']>>>
        : undefined
      : undefined
    : undefined
}
