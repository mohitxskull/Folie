import { FieldSchema } from '#validators/field'
import vine from '@vinejs/vine'

export const compileFields = (fields: FieldSchema[]) => {
  let schemaBase = vine.object({})

  for (const field of fields) {
    switch (field.type) {
      case 'string':
        let stringBase = vine.string()

        if (field.sub) {
          switch (field.sub.type) {
            case 'email':
              stringBase = stringBase.email(field.sub.options)
              break

            case 'url':
              stringBase = stringBase.url(field.sub.options)
              break
          }
        }

        if (field.options?.minLength && field.options.minLength > 0) {
          stringBase = stringBase.minLength(field.options.minLength)
        }

        if (field.options?.maxLength && field.options.maxLength > 0) {
          stringBase = stringBase.maxLength(field.options.maxLength)
        }

        if (field.options?.nullable) {
          stringBase = stringBase.nullable() as any
        }

        if (!field.options?.required) {
          stringBase = stringBase.optional() as any
        }

        schemaBase = vine.object({
          ...schemaBase.getProperties(),
          [field.key]: stringBase,
        })
        break

      case 'number':
        let numberBase = vine.number()

        if (field.options?.positive) {
          numberBase = numberBase.positive()
        }

        if (field.options?.negative) {
          numberBase = numberBase.negative()
        }

        if (field.options?.min && field.options.min > 0) {
          numberBase = numberBase.min(field.options.min)
        }

        if (field.options?.max && field.options.max > 0) {
          numberBase = numberBase.max(field.options.max)
        }

        if (field.options?.nullable) {
          numberBase = numberBase.nullable() as any
        }

        if (!field.options?.required) {
          numberBase = numberBase.optional() as any
        }

        schemaBase = vine.object({
          ...schemaBase.getProperties(),
          [field.key]: numberBase,
        })
        break
    }
  }

  return schemaBase
}
