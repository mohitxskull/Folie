import { UseQueryResult } from '@tanstack/react-query'

export type QueryLoaderBaseProps<OUT> = {
  children: (data: NonNullable<OUT>) => React.ReactNode
  conditions?: (data: NonNullable<OUT>) => React.ReactNode
  query: UseQueryResult<OUT, unknown>
  loading?: React.ReactNode
  error?: React.ReactNode
  noData?: React.ReactNode
}

export const QueryLoaderBase = <OUT,>(props: QueryLoaderBaseProps<OUT>) => {
  if (props.query.isLoading) {
    return props.loading ?? 'Loading...'
  }

  if (props.query.isError) {
    return props.error ?? 'Error'
  }

  const { data } = props.query

  if (!data) {
    return props.noData ?? 'No data'
  }

  if (props.conditions) {
    const conditions = props.conditions(data)

    if (conditions !== null || conditions !== undefined) {
      return conditions
    }
  }

  return props.children(data)
}
