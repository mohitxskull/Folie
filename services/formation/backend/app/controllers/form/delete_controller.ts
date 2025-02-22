import vine from '@vinejs/vine'
import { safeRoute } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { Form, serializeForm } from '#config/mongo'
import { DateTime } from 'luxon'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        formId: ObjectIdSchema,
      }),
    })
  )

  handle = safeRoute({
    input: this.input,

    handle: async ({ payload }) => {
      const form = await Form.findOne({
        _id: payload.params.formId,
        status: { $ne: 'deleted' },
      })

      if (!form) {
        throw new ProcessingException('Form not found')
      }

      form.updatedAt = DateTime.utc().toJSDate()
      form.status = 'deleted'

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
}
