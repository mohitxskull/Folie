import { CacheProvider, GetSetFactory, SetCommonOptions } from '@adonisjs/cache/types'

const DEFAULT_KEY = 'D0'

export class KeyCache<T> {
  readonly key: string

  readonly space: CacheProvider

  readonly options: SetCommonOptions

  readonly #get: () => Promise<T>

  constructor(
    space: CacheProvider,
    params: {
      key: string
      factory: GetSetFactory<T>
    } & SetCommonOptions
  ) {
    const { key, factory, ...options } = params

    this.key = key
    this.options = options

    this.space = space.namespace(key)

    this.#get = async () => {
      return this.space.getOrSet({
        key: DEFAULT_KEY,
        factory,
        ...options,
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
      ...this.options,
    })
  }

  /**
   * Removes all items from the cache
   */
  clear() {
    return this.space.clear()
  }

  /**
   * Delete a key from the cache Returns true if the key was deleted, false otherwise
   */
  delete(key?: string) {
    return this.space.delete({
      key: key ?? DEFAULT_KEY,
    })
  }

  /**
   * Expire a key from the cache. Entry will not be fully deleted but expired and retained for the grace period if enabled.
   */
  expire(key?: string) {
    return this.space.expire({
      key: key ?? DEFAULT_KEY,
    })
  }
}
