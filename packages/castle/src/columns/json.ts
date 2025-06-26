import { ColumnOptions } from '@adonisjs/lucid/types/model'

export const JSONColumn = (
  options?: Partial<
    ColumnOptions & {
      serializer?: {
        serialize(value: any): string
        deserialize(value: any): any
      }
    }
  >
): Partial<ColumnOptions> => {
  const { serializer, ...restOptions } = options || {}

  const serialize = serializer?.serialize || JSON.stringify
  const deserialize = serializer?.deserialize || JSON.parse

  return {
    prepare: (value: any) => {
      if (!value) {
        return null
      }

      return serialize(value)
    },

    consume: (value: any) => {
      if (!value) {
        return null
      }

      return deserialize(value)
    },

    ...restOptions,
  }
}
