import vine from '@vinejs/vine'
import { routeController } from '@folie/castle'
import { Form } from '#config/mongo'
import { DateTime } from 'luxon'
import { TextSchema } from '@folie/castle/validator/index'
import ProcessingException from '@folie/castle/exception/processing_exception'

export default routeController({
  input: vine.compile(
    vine.object({
      name: TextSchema,
    })
  ),

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
