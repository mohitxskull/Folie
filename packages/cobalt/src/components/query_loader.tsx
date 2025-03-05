import { UseQueryResult } from '@tanstack/react-query'

export type QueryLoaderProps<OUT> = {
  children: (data: NonNullable<OUT>) => React.ReactNode
  conditions?: (data: NonNullable<OUT>) => React.ReactNode
  query: UseQueryResult<OUT, unknown>
  isLoading?: React.ReactNode
  isError?: React.ReactNode
  noData?: React.ReactNode
}

export const QueryLoader = <OUT,>(props: QueryLoaderProps<OUT>) => {
  if (props.query.isLoading) {
    return props.isLoading ?? 'Loading...'
  }

  if (props.query.isError) {
    return props.isError ?? 'Error'
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
