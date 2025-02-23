import vine from '@vinejs/vine'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { Form, serializePublicForm } from '#config/mongo'

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
      '_id': payload.params.formId,
      'status': 'active',
      'schema.published': {
        $exists: true,
      },
    })

    if (!form) {
      throw new ProcessingException('Form not found')
    }

    return serializePublicForm(form)
  },
})
