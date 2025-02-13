import { ZodType } from 'zod'

export const validate = async <T>(data: T, schema: ZodType<T>): Promise<boolean | string> => {
  const result = schema.safeParse(data)

  if (result.success) {
    return true
  }

  return result.error.errors[0].message
}
