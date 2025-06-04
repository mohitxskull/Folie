import { ExtendedPivotOptions, PivotOptions } from '../types/castle.js'

export const createPivotReference = <
  TKeys extends string,
  Pivot extends Record<string, ExtendedPivotOptions<TKeys>>,
>(
  config: Pivot,
  tableReference: Record<TKeys, (column?: string) => string>
): Record<
  keyof Pivot,
  {
    pivotTable: string
    pivotTimestamps: boolean
  } & PivotOptions
> => {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      key,
      {
        // Default pivotTimestamps to true if not explicitly set
        pivotTimestamps: true,
        ...value,
        // Resolve the pivotTable using the provided tableModule function
        pivotTable: value.pivotTable(tableReference),
      },
    ])
  ) as Record<
    keyof Pivot,
    {
      pivotTable: string
      pivotTimestamps: boolean
    } & PivotOptions
  >
}
