import { FieldSchema } from '#validators/field'
import { md5 } from './md5.js'

export const fieldHash = (fields: FieldSchema[]) => {
  return md5(
    fields
      .map((item) => ({
        key: item.key,
        type: item.type,
      }))
      .sort((a, b) => a.key.localeCompare(b.key))
  )
}
