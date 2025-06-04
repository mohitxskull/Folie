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

export type ExtendedPivotOptions<TKeys extends string> = Omit<PivotOptions, 'pivotTable'> & {
  pivotTable: (table: Record<TKeys, (column?: string) => string>) => string
}
