import vine from '@vinejs/vine'
import { safeRoute } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { Form } from '#config/mongo'
import { DateTime } from 'luxon'
import { TextSchema } from '@folie/castle/validator/index'
import { slugify } from '@folie/castle/helpers/slugify'
import { fieldHash } from '#helpers/field_hash'
import { CaptchaSchema } from '#validators/captcha'
import { FieldArraySchema } from '#validators/field'

export default class Controller {
  input = vine.compile(
    vine.object({
      name: TextSchema,
      captcha: CaptchaSchema,
      fields: FieldArraySchema,
    })
  )

  handle = safeRoute({
    input: this.input,

    handle: async ({ payload }) => {
      const slug = slugify(payload.name)

      const exist = await Form.findOne({ slug })

      if (exist) {
        throw new ProcessingException('Form with this name already exists', {
          source: 'name',
        })
      }

      await Form.insertOne({
        status: 'inactive',
        slug,
        name: payload.name,
        schema: [
          {
            version: 1,
            hash: fieldHash(payload.fields),
            fields: payload.fields,
            createdAt: DateTime.utc().toJSDate(),
            updatedAt: DateTime.utc().toJSDate(),
          },
        ],
        activeSchema: 1,
        captcha: payload.captcha || null,
        createdAt: DateTime.utc().toJSDate(),
        updatedAt: DateTime.utc().toJSDate(),
        deletedAt: null,
      })

      return { message: 'Form created' }
    },
  })
}
