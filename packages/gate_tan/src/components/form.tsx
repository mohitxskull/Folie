import { Stack, StackProps } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { UseMutationResult } from '@tanstack/react-query'
import React from 'react'

const Form = <
  MUTATION extends Omit<UseMutationResult<any, any, any, any>, 'mutate' | 'mutateAsync'>,
  INPUT extends Exclude<MUTATION['variables'], undefined>,
  FORM extends UseFormReturnType<INPUT>,
>(props: {
  mutation: MUTATION
  form: FORM

  children: (params: { loading: boolean; dirty: boolean }) => React.ReactNode
  submit: (input: INPUT) => void

  props?: {
    stack?: StackProps
  }

  ref?: React.Ref<HTMLFormElement>
}) => {
  return (
    <>
      <form
        ref={props.ref}
        onSubmit={props.form.onSubmit((values) => {
          props.submit(values)
        })}
      >
        <Stack {...props.props?.stack}>
          {props.children({
            loading: props.mutation.isPending,
            dirty: props.form.isDirty(),
          })}
        </Stack>
      </form>
    </>
  )
}

export { Form }
