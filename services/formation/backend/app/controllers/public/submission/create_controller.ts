import vine from '@vinejs/vine'
import { safeRoute } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { Form, Submission } from '#config/mongo'
import { DateTime } from 'luxon'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { CaptchaService } from '@folie/castle/service/captcha_service'
import { Secret } from '@adonisjs/core/helpers'
import { FormHelper } from '#helpers/form_helpers'

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
        '_id': payload.params.formId,
        'status': 'active',
        'schema.published': {
          $exists: true,
        },
      })

      if (!form) {
        throw new ProcessingException('Form not found')
      }

      const { published } = form.schema

      if (!published) {
        throw new Error('Form does not have a published version', {
          cause: {
            form,
          },
        })
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

      const compiledSchema = vine.compile(
        vine.object({
          fields: FormHelper.compile(published),
        })
      )

      const parsedFields = await compiledSchema.validate({ fields: payload.fields })

      await Submission.insertOne({
        formId: form._id,
        fields: Object.entries(parsedFields.fields).reduce<typeof parsedFields.fields>(
          (res, [slugKey, value]) => {
            const field = published.find((f) => f.slug === slugKey)

            if (!field) {
              throw new ProcessingException('Field not found', {
                meta: {
                  field: slugKey,
                },
              })
            }

            return {
              ...res,
              [field.key]: value,
            }
          },
          {}
        ),
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
