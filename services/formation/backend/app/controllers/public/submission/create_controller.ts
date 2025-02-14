import vine from '@vinejs/vine'
import { safeRoute } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { Form, Submission } from '#config/mongo'
import { DateTime } from 'luxon'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { CaptchaService } from '@folie/castle/service/captcha_service'
import { Secret } from '@adonisjs/core/helpers'
import { compileFields } from '#helpers/compile_fields'
import { getFormSchema } from '#helpers/get_schema'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        formId: ObjectIdSchema,
      }),

      query: vine
        .object({
          captcha: vine.string().maxLength(2048).minLength(10).optional(),
        })
        .optional(),

      fields: vine.record(vine.any()),
    })
  )

  handle = safeRoute({
    input: this.input,

    handle: async ({ payload, ctx }) => {
      const form = await Form.findOne({
        _id: payload.params.formId,
        status: 'active',
      })

      if (!form) {
        throw new ProcessingException('Form not found')
      }

      if (form.captcha) {
        if (!payload.query?.captcha) {
          throw new ProcessingException('Captcha is required')
        }

        const captchaService = new CaptchaService({
          privateKey: new Secret(form.captcha.private),
        })

        const [isValid] = await captchaService.verify({
          token: payload.query.captcha,
          ip: ctx.request.ip(),
        })

        if (!isValid) {
          throw new ProcessingException('Invalid captcha', {
            meta: {
              token: payload.query.captcha,
              ip: ctx.request.ip(),
            },
          })
        }
      }

      const activeSchema = getFormSchema(form.schema)

      // Precautionary measure to ensure that the active schema is not null or undefined
      if (!activeSchema) {
        throw new Error('Active schema not found', {
          cause: {
            formId: form._id,
          },
        })
      }

      const compiledSchema = vine.compile(
        vine.object({
          fields: compileFields(activeSchema.fields),
        })
      )

      const parsedFields = await compiledSchema.validate({ fields: payload.fields })

      await Submission.insertOne({
        formId: form._id,
        fields: parsedFields.fields,
        schemaVersion: activeSchema.version,
        submittedAt: DateTime.utc().toJSDate(),
        meta: {
          ip: ctx.request.ip(),
          captcha: !!form.captcha,
        },
      })

      return {
        message: 'Thank you for your submission',
      }
    },
  })
}
