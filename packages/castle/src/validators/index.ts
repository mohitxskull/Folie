import vine, { VineDate } from '@vinejs/vine'
import { DateTime } from 'luxon'

export const PageSchema = vine.number().range([1, 100000])

export const LimitSchema = vine.number().range([1, 100])

export const OrderDirSchema = vine.enum(['asc', 'desc'])

export const OrderSchema = <FIELDS extends readonly string[]>(...fields: FIELDS) => {
  return vine.object({
    by: vine.enum(fields),
    dir: OrderDirSchema.optional(),
  })
}

// ====================

export const MetadataSchema = vine.record(vine.string().minLength(1).maxLength(200))

export const SlugSchema = vine
  .string()
  .minLength(1)
  .maxLength(50)
  .regex(/^[a-z0-9\-]+$/)
  .transform((value) => value.toLowerCase())

export const DateSchema = (callback?: (v: VineDate) => VineDate) => {
  const base = vine.date({ formats: ['iso8601'] })

  return (callback ? callback(base) : base).transform((value) => {
    return DateTime.fromJSDate(value).toUTC()
  })
}
