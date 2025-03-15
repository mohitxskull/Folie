import { ExtendedPivotOptions, PivotOptions } from '../src/types/castle.js'

export class CastleModule<
  Table extends Record<string, string>,
  Pivot extends Record<string, ExtendedPivotOptions<Table>>,
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
    this.table = Object.fromEntries(
      Object.entries(params.config.table).map(([key, value]) => [
        key,
        (column?: string) => (column ? `${value}.${column}` : value),
      ])
    ) as Record<keyof Table, (column?: string) => string>

    this.pivot = Object.fromEntries(
      Object.entries(params.config.pivot ?? {}).map(([key, value]) => [
        key,
        {
          pivotTimestamps: true,
          ...value,
          pivotTable: value.pivotTable(this.table),
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
}
