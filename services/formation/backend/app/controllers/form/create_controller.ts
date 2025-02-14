import vine from '@vinejs/vine'
import { safeRoute } from '@folie/castle'
import { Form } from '#config/mongo'
import { DateTime } from 'luxon'
import { TextSchema } from '@folie/castle/validator/index'
import { fieldHash } from '#helpers/field_hash'
import { FieldArraySchema } from '#validators/field'
import ProcessingException from '@folie/castle/exception/processing_exception'

export default class Controller {
  input = vine.compile(
    vine.object({
      name: TextSchema,
      fields: FieldArraySchema,
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
        schema: [
          {
            version: 0,
            hash: fieldHash(payload.fields),
            fields: payload.fields,
            createdAt: DateTime.utc().toJSDate(),
            updatedAt: DateTime.utc().toJSDate(),
          },
        ],
        captcha: null,
        createdAt: DateTime.utc().toJSDate(),
        updatedAt: DateTime.utc().toJSDate(),
        deletedAt: null,
      })

      return { message: 'Form created' }
    },
  })
}
