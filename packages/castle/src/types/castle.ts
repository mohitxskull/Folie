export type PivotOptions = {
  pivotTable: string
  pivotColumns?: string[]
  localKey?: string
  pivotForeignKey?: string
  relatedKey?: string
  pivotRelatedForeignKey?: string
  pivotTimestamps?:
    | boolean
    | {
        createdAt: string | boolean
        updatedAt: string | boolean
      }
  serializeAs?: string | null
  meta?: any
}
