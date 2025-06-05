import { LucidModel, ModelAssignOptions, ModelAttributes } from '@adonisjs/lucid/types/model'
import { MakePropsDynamic, resolveDynamicProps } from '@folie/lib'

export class Holder<T extends LucidModel> {
  #getInstance: (options?: ModelAssignOptions) => Promise<InstanceType<T>>

  #instance?: InstanceType<T>

  constructor(
    base: T,
    searchPayload: MakePropsDynamic<Partial<ModelAttributes<InstanceType<T>>>>,
    savePayload: MakePropsDynamic<Partial<ModelAttributes<InstanceType<T>>>>,
    manual?: (instance: InstanceType<T>) => InstanceType<T>
  ) {
    this.#getInstance = async (options) => {
      let instance = await base.firstOrCreate(
        resolveDynamicProps(searchPayload),
        resolveDynamicProps(savePayload),
        options
      )

      if (manual) {
        instance = manual(instance)
      }

      return instance
    }
  }

  async sync(options?: ModelAssignOptions) {
    this.#instance = await this.#getInstance(options)

    return this.instance
  }

  get hasSynced() {
    return !!this.#instance
  }

  get instance() {
    if (!this.#instance) {
      throw new Error('call sync() before getting the instance')
    }

    return this.#instance
  }
}

export class HolderFactory<T extends LucidModel> {
  #base: T

  constructor(base: T) {
    this.#base = base
  }

  create(
    searchPayload: MakePropsDynamic<Partial<ModelAttributes<InstanceType<T>>>>,
    updatePayload: MakePropsDynamic<Partial<ModelAttributes<InstanceType<T>>>>,
    manual?: (instance: InstanceType<T>) => InstanceType<T>
  ) {
    return new Holder(this.#base, searchPayload, updatePayload, manual)
  }
}

export class HolderSyncer<T extends LucidModel> {
  #holders: Holder<T>[]

  constructor(holders: Holder<T>[]) {
    this.#holders = holders
  }

  get hasSynced() {
    return this.#holders.every((holder) => holder.hasSynced)
  }

  async sync(options?: ModelAssignOptions) {
    for await (const holder of this.#holders) {
      await holder.sync(options)
    }
  }

  get instances() {
    if (!this.hasSynced) {
      throw new Error('call sync() before getting the instances')
    }

    return this.#holders.map((holder) => holder.instance)
  }
}
