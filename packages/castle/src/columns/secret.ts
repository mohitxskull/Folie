import { Secret } from '@adonisjs/core/helpers'
import { ColumnOptions } from '@adonisjs/lucid/types/model'
import encryption from '@adonisjs/core/services/encryption'

export const SecretColumn = <T = string>(
  options?: Partial<ColumnOptions>
): Partial<ColumnOptions> => ({
  prepare: (value: Secret<T> | null) => {
    if (!value) {
      return null
    }

    return encryption.encrypt(value.release())
  },

  consume: (value: T | null) => {
    if (!value) {
      return null
    }

    return new Secret(encryption.decrypt(value))
  },

  ...options,
})
