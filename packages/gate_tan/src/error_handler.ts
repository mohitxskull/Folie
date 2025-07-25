import { UseFormReturnType } from '@mantine/form'
import { GateError } from '@folie/gate'
import { getProperty } from 'dot-prop'

export const ErrorHandler = (params: {
  error: unknown
  form?: UseFormReturnType<any>
  notification: (params: { title?: string; message: string }) => void
}) => {
  if (params.error instanceof GateError) {
    const errorJSON = params.error.toJSON()

    if (errorJSON.response) {
      const formValues = params.form ? params.form.getValues() : {}

      if (errorJSON.response.metadata && Array.isArray(errorJSON.response.metadata)) {
        for (const multi of errorJSON.response.metadata) {
          if (params.form && multi.field && getProperty(formValues, multi.field) !== undefined) {
            params.form.setFieldError(multi.field, multi.message)
          } else {
            params.notification({
              title: multi.field,
              message: multi.message,
            })
          }
        }
      } else if (errorJSON.response.source) {
        if (
          params.form &&
          errorJSON.response.source &&
          getProperty(formValues, errorJSON.response.source) !== undefined
        ) {
          params.form.setFieldError(errorJSON.response.source, errorJSON.response.message)
        } else {
          params.notification({
            title: errorJSON.response.source,
            message: errorJSON.response.message,
          })
        }
      } else {
        params.notification({
          message: errorJSON.response.message,
        })
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
