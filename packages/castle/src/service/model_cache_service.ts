import { CacheProvider, GetSetFactory, SetCommonOptions } from '@adonisjs/cache/types'

// ==================================

type DefaultKeys = 'self'

type TargetModelT = {
  id: number
  $toJSON: () => any
  $isPersisted: boolean
  $hydrateOriginals: () => void
}

// ==================================

export class ModelCache<TargetModel extends TargetModelT, CacheKeys extends string> {
  constructor(
    private cache: StaticModelCache<TargetModel, CacheKeys>,
    private targetModel: TargetModel
  ) {}

  space() {
    return this.cache.space(this.targetModel.id)
  }

  key(key: DefaultKeys | CacheKeys) {
    return this.cache.key(key)
  }

  async expire(key: DefaultKeys | CacheKeys) {
    await this.space().delete({ key })
  }

  async get<T, O>(params: {
    key: DefaultKeys | CacheKeys
    factory: GetSetFactory<T>
    parser: (value: T) => Promise<O>
    options?: SetCommonOptions
    latest?: boolean
  }) {
    return this.cache.get({
      id: this.targetModel.id,
      key: params.key,
      factory: params.factory,
      parser: params.parser,
      options: params.options,
    })
  }
}

export class StaticModelCache<
  TargetModel extends TargetModelT,
  CacheKeys extends string = DefaultKeys,
> {
  constructor(
    private _cache: CacheProvider,
    private _fill: (values: ReturnType<TargetModel['$toJSON']>) => TargetModel,
    private _find: (id: number) => Promise<TargetModel | null>
  ) {}

  space(id: number) {
    return this._cache.namespace(String(id))
  }

  key(key: DefaultKeys | CacheKeys) {
    return key
  }

  async expire(params: { id: number; key: DefaultKeys | CacheKeys }) {
    await this.space(params.id).delete({ key: params.key })
  }

  async get<I, O>(params: {
    id: number
    key: DefaultKeys | CacheKeys
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
    const key = this.key('self')

    return this.get({
      id,
      key,
      options,
      factory: async () => {
        const res = await this._find(id)

        if (!res) {
          return null
        }

        return res.$toJSON()
      },
      parser: (row) => {
        if (!row) {
          return null
        }

        const res = this._fill(row)

        res.$hydrateOriginals()
        res.$isPersisted = true

        return res
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

  internal(targetModel: TargetModel) {
    return new ModelCache<TargetModel, CacheKeys>(this, targetModel)
  }
}
