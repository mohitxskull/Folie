export const createTableReference = <TTableConfig extends Record<string, string>>(
  tableConfig: TTableConfig
): {
  [K in keyof TTableConfig]: (columnName?: string) => string
} => {
  return Object.fromEntries(
    Object.entries(tableConfig).map(([tableAlias, tableName]) => [
      tableAlias,
      (columnName?: string) => (columnName ? `${tableName}.${columnName}` : tableName),
    ])
  ) as {
    [K in keyof TTableConfig]: (columnName?: string) => string
  }
}
