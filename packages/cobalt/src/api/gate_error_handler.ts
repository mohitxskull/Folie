import { UseFormReturnType } from '@mantine/form'
import { GateError } from '@folie/gate'
import { capitalCase } from 'case-anything'
import { getProperty } from 'dot-prop'

export const GateErrorHandler = (params: {
  error: unknown
  form?: UseFormReturnType<any>
  notification: (params: { title: string; message: string }) => void
}) => {
  if (params.error instanceof GateError) {
    switch (params.error.type) {
      case 'axios-response': {
        const data = params.error.parse()

        if (!data.success) {
          console.error(data)

          params.notification({
            title: 'Error',
            message: `An error occurred while parsing the response, please try again.`,
          })
          return
        }

        const formValues = params.form ? params.form.getValues() : {}

        for (const multi of data.data.multiple) {
          if (params.form && multi.source && getProperty(formValues, multi.source) !== undefined) {
            params.form.setFieldError(multi.source, multi.message)
          } else {
            params.notification({ title: capitalCase(data.data.title), message: multi.message })
          }
        }
        break
      }

      default: {
        console.error(params.error.toJSON())

        params.notification({
          title: capitalCase(params.error.type),
          message: params.error.message,
        })
        break
      }
    }
  } else {
    console.error(params.error)

    params.notification({
      title: 'Unrecognized Error',
      message: 'An unrecognized error has occurred. Please try again.',
    })
  }
}
