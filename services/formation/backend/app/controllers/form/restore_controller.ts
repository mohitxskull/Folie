import vine from '@vinejs/vine'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { Form, serializeForm } from '#config/mongo'
import { DateTime } from 'luxon'

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
      status: { value: 'deleted' },
    })

    if (!form) {
      throw new ProcessingException('Form not found')
    }

    form.updatedAt = DateTime.utc().toJSDate()
    form.status = 'inactive'

    await Form.updateOne(
      {
        _id: payload.params.formId,
      },
      {
        $set: {
          status: form.status,
          updatedAt: form.updatedAt,
        },
      }
    )

    return serializeForm(form)
  },
})
