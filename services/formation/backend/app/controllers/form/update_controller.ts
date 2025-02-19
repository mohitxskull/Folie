import vine from '@vinejs/vine'
import { safeRoute } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { Form, FormCollectionSchema, serializeForm, Submission } from '#config/mongo'
import { DateTime } from 'luxon'
import { MatchKeysAndValues } from 'mongodb'
import { DBFieldSchema, FieldArraySchema } from '#validators/field'
import { CaptchaSchema } from '#validators/captcha'
import { TextSchema } from '@folie/castle/validator/index'
import { slugify } from '@folie/castle/helpers/slugify'

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
        let updatedNeeded = true

        if (form.schema.draft) {
          const parsedPayloadFields = payload.fields
            .map((field) => {
              const { key, ...rest } = field

              return rest
            })
            .sort((a, b) => a.name.localeCompare(b.name))

          const parsedDraftFields = form.schema.draft
            .map((field) => {
              const { slug, key, ...rest } = field

              return rest
            })
            .sort((a, b) => a.name.localeCompare(b.name))

          if (JSON.stringify(parsedPayloadFields) === JSON.stringify(parsedDraftFields)) {
            updatedNeeded = false
          }
        }

        if (updatedNeeded) {
          const dbFields: DBFieldSchema[] = []

          if (form.schema.draft) {
            const payloadFields = payload.fields
            const draftFields = form.schema.draft

            const draftKeys = form.schema.draft.map((field) => field.key)

            const payloadKeys = payloadFields.reduce<number[]>((acc, field) => {
              if (field.key) {
                acc.push(field.key)
              }
              return acc
            }, [])

            const missingFields = draftFields.filter((field) => !payloadKeys.includes(field.key))

            payloadFields.push(
              ...missingFields.map((field) => ({
                ...field,
                key: field.key,
                slug: slugify(field.name),
              }))
            )

            for (const payloadField of payloadFields) {
              let fieldKey = payloadField.key

              if (fieldKey && draftKeys.includes(fieldKey)) {
                const draftField = draftFields.find((f) => f.key === fieldKey)

                if (!draftField) {
                  throw new Error(`Field with key ${fieldKey} not found in draft`, {
                    cause: {
                      draftFields,
                      fieldKey,
                    },
                  })
                }

                if (draftField.deleted && payloadField.deleted) {
                  dbFields.push(draftField)
                } else if (draftField.deleted && !payloadField.deleted) {
                  throw new ProcessingException(`You can't restore a deleted field`)
                } else if (!draftField.deleted && payloadField.deleted) {
                  const submissionCount = await Submission.countDocuments({
                    formId: form._id,
                    fields: {
                      [fieldKey]: { $exists: true },
                    },
                  })

                  if (submissionCount < 1) {
                    continue
                  }

                  dbFields.push({
                    ...draftField,
                    deleted: true,
                  })
                } else if (!draftField.deleted && !payloadField.deleted) {
                  dbFields.push({
                    ...payloadField,
                    key: fieldKey,
                    slug: slugify(payloadField.name),
                  })
                } else {
                  throw new Error(`Invalid field state`, {
                    cause: {
                      draftFields,
                      fieldKey,
                    },
                  })
                }
              } else {
                const newKey = Math.max(...draftKeys) + 1

                draftKeys.push(newKey)

                dbFields.push({
                  ...payloadField,
                  slug: slugify(payloadField.name),
                  key: newKey,
                })
              }
            }
          } else {
            for (const [fieldIndex, field] of payload.fields.entries()) {
              dbFields.push({
                ...field,
                key: fieldIndex,
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
