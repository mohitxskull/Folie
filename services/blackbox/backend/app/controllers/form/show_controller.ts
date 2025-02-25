import vine from '@vinejs/vine'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { Form, serializeForm } from '#config/mongo'

export default routeController({
  input: vine.compile(
    vine.object({
      params: vine.object({
        formId: ObjectIdSchema,
      }),
    })
  ),

  handle: async ({ payload }) => {
    const form = await Form.findOne({
      _id: payload.params.formId,
    })

    if (!form) {
      throw new ProcessingException('Form not found')
    }

    return serializeForm(form)
  },
})
