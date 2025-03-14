import { Children, type ReactNode } from 'react'

type RenderFn<T> = (item: T, index?: number) => ReactNode

export const For = <T,>({ children, each = [] }: { children: RenderFn<T>; each?: T[] }) =>
  Children.toArray(each.map((item, index) => children(item, index)))
