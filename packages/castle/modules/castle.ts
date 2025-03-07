import { PivotOptions } from '../src/types/castle.js'

export class CastleModule<
  Table extends Record<string, string>,
  Pivot extends Record<string, PivotOptions>,
> {
  readonly table: Record<keyof Table, (column?: string) => string>
  readonly pivot: Record<
    keyof Pivot,
    {
      pivotTable: string
      pivotTimestamps: boolean
    } & PivotOptions
  >

  constructor(params: { config: { table: Table; pivot?: Pivot } }) {
    this.table = Object.entries(params.config.table).reduce(
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
    )
    this.pivot = Object.entries(params.config.pivot ?? {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          pivotTimestamps: true,
          ...value,
        },
      }),
      {} as Record<
        keyof Pivot,
        {
          pivotTable: string
          pivotTimestamps: boolean
        } & PivotOptions
      >
    )
  }
}
