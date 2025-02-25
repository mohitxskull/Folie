import vine, { VineDate } from '@vinejs/vine'
import { DateTime } from 'luxon'
import { EmailOptions } from '@vinejs/vine/types'

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

export const EmailSchema = (options?: EmailOptions) => vine.string().email(options)

export const UsernameSchema = vine.string().minLength(1).maxLength(50).alphaNumeric({
  allowDashes: true,
  allowSpaces: false,
  allowUnderscores: false,
})

export const PasswordSchema = vine
  .string()
  .minLength(8)
  .maxLength(32)
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/)

export const TextSchema = vine.string().minLength(1).maxLength(100)

export const PhoneSchema = vine.string().mobile()

/**
 * A description with a maximum length of 1000 characters
 */
export const DescriptionSchema = vine.string().minLength(1).maxLength(1000)

/**
 * A description with a maximum length of 400 characters
 */
export const DescriptionSmallSchema = vine.string().minLength(1).maxLength(400)

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
