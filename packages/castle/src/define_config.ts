import type { PivotOptions } from './types.js'

export const defineConfig = <
  Table extends Record<string, string>,
  Pivot extends Record<
    string,
    {
      tableName: string
      options?: PivotOptions
    }
  >,
>(config: {
  table: Table
  pivot?: Pivot
}) => {
  return {
    table: Object.entries(config.table).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: (column?: string) => {
          if (column) {
            return `${value}.${column}`
          } else {
            return value
          }
        },
      }),
      {} as Record<keyof Table, (column?: string) => string>
    ),
    pivot: Object.entries(config.pivot ?? {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          pivotTable: value.tableName,
          pivotTimestamps: true,
          ...value.options,
        },
      }),
      {} as Record<
        keyof Pivot,
        {
          pivotTable: string
          pivotTimestamps: boolean
        } & PivotOptions
      >
    ),
  }
}
