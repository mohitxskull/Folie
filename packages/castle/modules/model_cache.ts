import { CacheProvider, GetSetFactory, SetCommonOptions } from '@adonisjs/cache/types'
import { LucidModel, LucidRow } from '@adonisjs/lucid/types/model'

// ==================================

type DefaultCacheKeys = 'self'

type TargetModel = LucidModel & {
  new (): LucidRow & {
    $toJSON: () => object

    id: number
  }
}

// ==================================

class RowCache<GTargetModel extends TargetModel, CacheKeys extends string> {
  #modelCache: ModelCache<GTargetModel, CacheKeys>
  #row: InstanceType<GTargetModel>

  constructor(modelCache: ModelCache<GTargetModel, CacheKeys>, row: InstanceType<GTargetModel>) {
    this.#modelCache = modelCache
    this.#row = row
  }

  space() {
    return this.#modelCache.space(this.#row.id)
  }

  key(key: DefaultCacheKeys | CacheKeys) {
    return this.#modelCache.key(key)
  }

  async expire(key: DefaultCacheKeys | CacheKeys) {
    await this.space().delete({ key })
  }

  async get<T, O>(params: {
    key: DefaultCacheKeys | CacheKeys
    factory: GetSetFactory<T>
    parser: (value: T) => Promise<O>
    options?: SetCommonOptions
    latest?: boolean
  }) {
    return this.#modelCache.get({
      id: this.#row.id,
      key: params.key,
      factory: params.factory,
      parser: params.parser,
      options: params.options,
    })
  }
}

export class ModelCache<GTargetModel extends TargetModel, CacheKeys extends string> {
  #model: GTargetModel
  #cache: CacheProvider

  constructor(
    model: GTargetModel,
    cache: (namespace: string) => CacheProvider,
    _?: readonly CacheKeys[]
  ) {
    this.#model = model
    this.#cache = cache(model.table)
  }

  space(id: number) {
    return this.#cache.namespace(String(id))
  }

  key(key: DefaultCacheKeys | CacheKeys) {
    return key
  }

  async expire(params: { id: number; key: DefaultCacheKeys | CacheKeys }) {
    await this.space(params.id).delete({ key: params.key })
  }

  async get<I, O>(params: {
    id: number
    key: DefaultCacheKeys | CacheKeys
    factory: GetSetFactory<I>
    parser: (value: I) => Promise<O> | O
    options?: SetCommonOptions
    latest?: boolean
  }) {
    if (params.latest) {
      await this.expire({ id: params.id, key: params.key })
    }

    const result: I = await this.space(params.id).getOrSet({
      key: params.key,
      factory: params.factory,
      ...params.options,
    })

    return params.parser(result)
  }

  async $find(id: number, options?: SetCommonOptions) {
    return this.get<object | null, InstanceType<GTargetModel> | null>({
      id,
      key: this.key('self'),
      options,
      factory: async () => {
        const res = await this.#model.find(id)

        if (!res) {
          return null
        }

        return res.$toJSON()
      },
      parser: (row) => {
        if (!row) {
          return null
        }

        const res = new this.#model().fill(row)

        res.$hydrateOriginals()
        res.$isPersisted = true

        return res as InstanceType<GTargetModel>
      },
    })
  }

  async $findStrict(id: number, options?: SetCommonOptions) {
    const res = await this.$find(id, options)

    if (!res) {
      throw new Error('Find strict failed', {
        cause: {
          id,
          options,
        },
      })
    }

    return res
  }

  row(row: InstanceType<GTargetModel>) {
    return new RowCache<GTargetModel, CacheKeys>(this, row)
  }
}
