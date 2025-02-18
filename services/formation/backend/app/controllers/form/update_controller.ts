import vine from '@vinejs/vine'
import { safeRoute } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { Form, FormCollectionSchema, serializeForm } from '#config/mongo'
import { DateTime } from 'luxon'
import { MatchKeysAndValues } from 'mongodb'
import { DBFieldSchema, FieldArraySchema } from '#validators/field'
import { CaptchaSchema } from '#validators/captcha'
import { TextSchema } from '@folie/castle/validator/index'
import { slugify } from '@folie/castle/helpers/slugify'
import { md5 } from '#helpers/md5'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        formId: ObjectIdSchema,
      }),

      name: TextSchema.optional(),
      captcha: CaptchaSchema.optional(),

      // Form can't be active if there is no published schema
      active: vine.boolean().optional(),

      // Turns Draft into Published Schema
      publish: vine.accepted().optional(),

      fields: FieldArraySchema.optional(),
    })
  )

  handle = safeRoute({
    input: this.input,

    handle: async ({ payload }) => {
      const form = await Form.findOne({
        _id: payload.params.formId,
      })

      if (!form) {
        throw new ProcessingException('Form not found')
      }

      if (form.status === 'deleted') {
        throw new ProcessingException(
          'Deleted forms cannot be updated, please restore the form first'
        )
      }

      let updates: MatchKeysAndValues<FormCollectionSchema> = {}

      if (payload.name !== undefined && form.name !== payload.name) {
        const exist = await Form.findOne({ name: payload.name, _id: { $ne: form._id } })

        if (exist) {
          throw new ProcessingException('Form with this name already exists', {
            source: 'name',
          })
        }

        form.name = payload.name

        updates = {
          ...updates,
          name: form.name,
        }
      }

      if (payload.active !== undefined) {
        if (payload.active === true && form.status !== 'active') {
          if (!form.schema.published) {
            throw new ProcessingException('Form schema must be published before activating', {
              source: 'active',
            })
          }

          form.status = 'active'

          updates = {
            ...updates,
            status: form.status,
          }
        }

        if (payload.active === false && form.status !== 'inactive') {
          form.status = 'inactive'

          updates = {
            ...updates,
            status: form.status,
          }
        }
      }

      if (payload.captcha !== undefined) {
        if (payload.captcha) {
          if (payload.captcha.private !== form.captcha?.private) {
            form.captcha = {
              private: payload.captcha.private,
              public: payload.captcha.public,
            }

            updates = {
              ...updates,
              captcha: form.captcha,
            }
          }
        } else {
          form.captcha = null

          updates = {
            ...updates,
            captcha: null,
          }
        }
      }

      if (payload.fields !== undefined) {
        const dbFields: DBFieldSchema[] = []

        if (form.schema.draft) {
          if (md5(payload.fields) === md5(form.schema.draft)) {
            throw new ProcessingException('Fields are up to date', {
              meta: {
                formId: form._id,
              },
            })
          }

          const formFieldKeys = form.schema.draft.map((field) => field.key)
          const payloadFieldKeys: number[] = []

          for (const field of payload.fields) {
            if (field.key) {
              payloadFieldKeys.push(field.key)
            }
          }

          const missingKeys = formFieldKeys.filter((key) => !payloadFieldKeys.includes(key))

          if (missingKeys.length > 0) {
            throw new ProcessingException('Some fields are missing', {
              meta: {
                missingKeys,
                formId: form._id,
              },
            })
          }

          const extraKeys = payloadFieldKeys.filter((key) => !formFieldKeys.includes(key))

          for (const field of payload.fields) {
            const fieldKey = field.key

            if (!fieldKey || (fieldKey && extraKeys.includes(fieldKey))) {
              const newKey = Math.max(...formFieldKeys) + 1

              formFieldKeys.push(newKey)
            }

            if (!fieldKey) {
              throw new Error('Field key already exists')
            }

            dbFields.push({
              ...field,
              slug: slugify(field.name),
              key: fieldKey,
            })
          }
        } else {
          for (const [fieldIndex, field] of payload.fields.entries()) {
            dbFields.push({
              ...field,
              key: fieldIndex + 1,
              slug: slugify(field.name),
            })
          }
        }

        form.schema = {
          ...form.schema,
          draft: dbFields,
        }

        updates = {
          ...updates,
          schema: form.schema,
        }
      }

      if (payload.publish !== undefined) {
        if (!form.schema.draft) {
          throw new ProcessingException('There is no draft version of the form to publish')
        }

        form.schema = {
          ...form.schema,
          published: form.schema.draft,
          draft: undefined,
        }

        updates = {
          ...updates,
          schema: form.schema,
        }
      }

      if (Object.keys(updates).length > 0) {
        updates = {
          ...updates,
          updatedAt: DateTime.utc().toJSDate(),
        }

        await Form.updateOne({ _id: payload.params.formId }, { $set: updates })
      }

      return { form: serializeForm(form), message: 'Form updated' }
    },
  })
}
