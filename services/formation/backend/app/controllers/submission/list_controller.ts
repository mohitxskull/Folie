import { Form, Submission, SubmissionCollectionSchema } from '#config/mongo'
import { ObjectIdSchema } from '#miscellaneous/object_id_rule'
import { safeRoute } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { serializeDT } from '@folie/castle/helpers/serialize'
import { LimitSchema, PageSchema } from '@folie/castle/validator/index'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { Filter } from 'mongodb'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        formId: ObjectIdSchema,
      }),

      query: vine.object({
        schemaVersion: vine.number().min(1).max(100000),

        page: PageSchema.optional(),
        limit: LimitSchema.optional(),
      }),
    })
  )

  handle = safeRoute({
    input: this.input,

    handle: async ({ payload }) => {
      const form = await Form.findOne({
        _id: payload.params.formId,
        schema: {
          $elemMatch: {
            // Use $elemMatch to match within the array
            version: payload.query.schemaVersion,
          },
        },
        status: {
          $ne: 'deleted',
        },
      })

      if (!form) {
        throw new ProcessingException('Form not found')
      }

      const selectedSchema = form.schema.find(
        (schema) => schema.version === payload.query.schemaVersion
      )

      if (!selectedSchema) {
        throw new Error('Schema not found', {
          cause: {
            formId: payload.params.formId,
          },
        })
      }

      const page = payload.query.page ?? 1
      const limit = payload.query.limit ?? 10

      const filter: Filter<SubmissionCollectionSchema> = {
        formId: payload.params.formId,
        schemaVersion: payload.query.schemaVersion,
      }

      const skip = (page - 1) * limit

      const [submissions, totalSubmissions] = await Promise.all([
        Submission.find(filter)
          .sort({
            submittedAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .toArray(),
        Submission.countDocuments(filter),
      ])

      return {
        schema: selectedSchema,
        data: submissions.map((s) => ({
          id: s._id.toString(),
          formId: s.formId,
          meta: s.meta,
          fields: s.fields,
          createdAt: serializeDT(DateTime.fromJSDate(s.submittedAt)),
        })),
        meta: {
          page,
          limit,
          total: {
            object: totalSubmissions,
            page: Math.ceil(totalSubmissions / limit),
          },
        },
      }
    },
  })
}
