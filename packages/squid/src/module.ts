import { Secret } from '@adonisjs/core/helpers'
import { Squid } from './index.js'
import { SquidParams } from './types.js'

export class SquidModule {
  private secret: Secret<string>

  constructor(secret: string) {
    this.secret = new Secret(secret)
  }

  create(params: SquidParams) {
    return new Squid(this.secret, params)
  }

  /**
   * Creates a group of Squid instances with the provided parameters.
   */
  group<T extends Record<string, SquidParams>>(params: T) {
    return Object.entries(params).reduce(
      (acc, [key, value]) => {
        return {
          ...acc,
          [key]: this.create(value),
        }
      },
      {} as Record<keyof T, Squid>
    )
  }
}
