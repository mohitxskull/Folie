import vine from '@vinejs/vine'
import { safeRoute } from '@folie/castle'
import { Form } from '#config/mongo'
import { DateTime } from 'luxon'
import { TextSchema } from '@folie/castle/validator/index'
import ProcessingException from '@folie/castle/exception/processing_exception'

export default class Controller {
  input = vine.compile(
    vine.object({
      name: TextSchema,
    })
  )

  handle = safeRoute({
    input: this.input,

    handle: async ({ payload }) => {
      const exists = await Form.findOne({ name: payload.name })

      if (exists) {
        throw new ProcessingException('Form already exists with the same name', {
          source: 'name',
        })
      }

      await Form.insertOne({
        status: 'inactive',
        name: payload.name,
        schema: {},
        captcha: null,
        createdAt: DateTime.utc().toJSDate(),
        updatedAt: DateTime.utc().toJSDate(),
      })

      return { message: 'Form created' }
    },
  })
}
