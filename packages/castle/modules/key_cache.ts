import { CacheProvider, GetSetFactory, SetCommonOptions } from '@adonisjs/cache/types'

export class KeyCache<T> {
  readonly key: string

  readonly space: CacheProvider

  readonly #get: () => Promise<T>

  constructor(
    space: CacheProvider,
    params: {
      key: string
      factory: GetSetFactory<T>
    } & SetCommonOptions
  ) {
    const { key, ...restParams } = params

    this.key = key

    this.space = space.namespace(key)

    this.#get = async () => {
      return this.space.getOrSet({
        key: 'default',
        ...restParams,
      })
    }
  }

  get() {
    return this.#get()
  }

  extend(key: string) {
    return new KeyCache<T>(this.space, {
      key: key,
      factory: this.#get,
    })
  }

  clear() {
    return this.space.clear()
  }

  delete(key?: string) {
    return this.space.delete({
      key: key ?? 'default',
    })
  }

  expire(key?: string) {
    return this.space.expire({
      key: key ?? 'default',
    })
  }
}
