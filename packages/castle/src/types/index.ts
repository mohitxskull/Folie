export type Metadata<T = Record<string, string | number | boolean | null>> = T | null

export type ValidationError = {
  message: string
  field: string
  rule: string
  index?: number
  meta?: Record<string, any>
}
