import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import { ObjectId } from 'mongodb'

const hexRegex = /^[0-9a-fA-F]{24}$/ // Regex to check for 24 hex characters

/**
 * Implementation
 */
async function implementation(value: unknown, _: unknown, field: FieldContext) {
  /**
   * We do not want to deal with non-string
   * values. The "string" rule will handle the
   * the validation.
   */
  if (typeof value !== 'string') {
    return
  }

  if (value.length !== 24) {
    field.report('The {{ field }} field is not a valid ObjectId', 'isObjectId', field, {
      length: value.length,
      reason: 'Invalid length',
    })
  }

  if (!hexRegex.test(value)) {
    field.report('The {{ field }} field is not a valid ObjectId', 'isObjectId', field, {
      value,
      reason: 'Invalid hex characters',
    })
  }

  try {
    new ObjectId(value)
  } catch (error) {
    field.report('The {{ field }} field is not a valid ObjectId', 'isObjectId', field, {
      value,
      reason: 'Invalid ObjectId',
    })
  }
}

/**
 * Converting a function to a VineJS rule
 */
export const isObjectIdRule = vine.createRule(implementation)

export const ObjectIdSchema = vine
  .string()
  .fixedLength(24)
  .use(isObjectIdRule())
  .transform((v) => new ObjectId(v))
