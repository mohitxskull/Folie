import vine from '@vinejs/vine'
import { safeRoute } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { Form, FormCollectionSchema, serializeForm, Submission } from '#config/mongo'
import { DateTime } from 'luxon'
import { fieldHash } from '#helpers/field_hash'
import { md5 } from '#helpers/md5'
import { MatchKeysAndValues } from 'mongodb'
import { FieldArraySchema } from '#validators/field'
import { CaptchaSchema } from '#validators/captcha'
import { TextSchema } from '@folie/castle/validator/index'
import { getFormSchema } from '#helpers/get_schema'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        formId: ObjectIdSchema,
      }),

      name: TextSchema.optional(),
      captcha: CaptchaSchema.optional(),
      active: vine.boolean().optional(),
      fields: FieldArraySchema.optional(),
    })
  )

  handle = safeRoute({
    input: this.input,

    handle: async ({ payload }) => {
      const form = await Form.findOne({ _id: payload.params.formId })

      if (!form) {
        throw new ProcessingException('Form not found')
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
          form.status = 'active'

          updates = {
            ...updates,
            status: 'active',
          }
        }

        if (payload.active === false && form.status !== 'inactive') {
          form.status = 'inactive'

          updates = {
            ...updates,
            status: 'inactive',
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
        const latestSchema = getFormSchema(form.schema)

        const isSchemaChanged = md5(payload.fields) !== md5(latestSchema.fields)

        if (isSchemaChanged) {
          const payloadSchemaHash = fieldHash(payload.fields)

          const isSchemaHashChanged = latestSchema.hash !== payloadSchemaHash

          if (isSchemaHashChanged) {
            if (form.schema.length > 4) {
              const oldestSchema = getFormSchema(form.schema, 'oldest')

              await Submission.deleteMany({
                formId: payload.params.formId,
                schemaVersion: oldestSchema.version,
              })

              form.schema = form.schema.filter((s) => s.version !== oldestSchema.version)
            }

            const newVersion = latestSchema.version + 1

            form.schema.push({
              version: newVersion,
              hash: payloadSchemaHash,
              fields: payload.fields,
              createdAt: DateTime.utc().toJSDate(),
              updatedAt: DateTime.utc().toJSDate(),
            })

            updates = {
              ...updates,
              schema: form.schema,
            }
          } else {
            form.schema = form.schema.map((s) => {
              if (s.version === latestSchema.version) {
                if (!payload.fields) {
                  throw new Error('Schema is required', {
                    cause: {
                      reason: 'Schema was checked for undefined value',
                    },
                  })
                }

                s.fields = payload.fields
                s.updatedAt = DateTime.utc().toJSDate()
              }

              return s
            })

            updates = {
              ...updates,
              schema: form.schema,
            }
          }
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
