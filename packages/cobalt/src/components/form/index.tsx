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
  checkpoint?: (values: INPUT) => boolean

  props?: {
    stack?: StackProps
  }
}) => {
  return (
    <>
      <form
        onSubmit={props.form.onSubmit(async (values) => {
          if (props?.checkpoint) {
            const result = props.checkpoint(values)

            if (result === false) {
              return
            }
          }

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
