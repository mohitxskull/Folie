import { DateTime } from 'luxon'
import superjson from 'superjson'

superjson.registerCustom<DateTime, string>(
  {
    isApplicable: (v): v is DateTime => v instanceof DateTime,
    serialize: (v) => {
      const iso = v.toISO()

      if (!iso) {
        throw new Error('Invalid DateTime')
      }

      return iso
    },
    deserialize: (v) => DateTime.fromISO(v),
  },
  'DateTime'
)

export { superjson }
