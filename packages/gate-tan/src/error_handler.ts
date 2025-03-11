import { UseFormReturnType } from '@mantine/form'
import { GateError } from '@folie/gate'
import { capitalCase } from 'case-anything'
import { getProperty } from 'dot-prop'

export const ErrorHandler = (params: {
  error: unknown
  form?: UseFormReturnType<any>
  notification: (params: { title: string; message: string }) => void
}) => {
  if (params.error instanceof GateError) {
    const errorJSON = params.error.toJSON()

    if (errorJSON.response) {
      const formValues = params.form ? params.form.getValues() : {}

      for (const multi of errorJSON.response.multiple) {
        if (params.form && multi.source && getProperty(formValues, multi.source) !== undefined) {
          params.form.setFieldError(multi.source, multi.message)
        } else {
          params.notification({
            title: capitalCase(errorJSON.response.title),
            message: multi.message,
          })
        }
      }
    } else {
      console.error(params.error.toJSON())

      params.notification({
        title: 'Client Error',
        message: params.error.message,
      })
    }
  } else {
    console.error(params.error)

    params.notification({
      title: 'Unrecognized Error',
      message: 'An unrecognized error has occurred. Please try again.',
    })
  }
}
