import { UseFormReturnType } from '@mantine/form'

export type FormInputTransformType = 'default'

export type GetInputPropOptions<Values> = NonNullable<
  Parameters<UseFormReturnType<Values>['getInputProps']>[1]
> & {
  // transform?: FormInputTransformType
  disabled?: (disabled: boolean) => boolean
}

export type GetInputPropsReturnType<Values> = ReturnType<
  UseFormReturnType<Values>['getInputProps']
> & {
  disabled: boolean
  [key: string]: any
}

export type SetPartialState<T extends Record<string, unknown>> = (
  statePartial: Partial<T> | ((currentState: T) => Partial<T>)
) => void
