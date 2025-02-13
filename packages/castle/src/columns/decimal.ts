import { ColumnOptions } from '@adonisjs/lucid/types/model'
import { Decimal } from '../miscellaneous/decimal.js'

export const DecimalColumn = (options?: Partial<ColumnOptions>): Partial<ColumnOptions> => ({
  prepare: (value: Decimal | null) => {
    if (!(value instanceof Decimal)) {
      return null
    }

    if (value.lt(0)) {
      throw new Error('ISE', {
        cause: {
          reason: "Money can't be negative",
          value: value.toString(),
        },
      })
    }

    return value.toString()
  },

  consume: (value: string | null) => {
    if (typeof value !== 'string') {
      return null
    }

    return new Decimal(value)
  },
  ...options,
})
