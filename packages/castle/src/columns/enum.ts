import { ColumnOptions } from '@adonisjs/lucid/types/model'

export const EnumColumn = (
  rec: Record<string, number>,
  options?: Partial<ColumnOptions>
): Partial<ColumnOptions> => ({
  prepare: (value?: string | null) => {
    if (typeof value !== 'string') {
      return null
    }

    return rec[value] ?? null
  },

  consume: (value?: number | null) => {
    if (typeof value !== 'number') {
      return null
    }

    let result: string | null = null

    for (const key in rec) {
      if (rec[key] === value) {
        result = key
        break
      }
    }

    return result
  },

  ...options,
})
