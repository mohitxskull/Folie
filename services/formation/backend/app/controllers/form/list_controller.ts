import { Form, FormCollectionSchema, serializeForm } from '#config/mongo'
import { safeRoute } from '@folie/castle'
import { LimitSchema, PageSchema } from '@folie/castle/validator/index'
import vine from '@vinejs/vine'
import { Filter } from 'mongodb'

export default class Controller {
  input = vine.compile(
    vine.object({
      query: vine.object({
        deleted: vine.boolean().optional(),

        page: PageSchema.optional(),
        limit: LimitSchema.optional(),
      }),
    })
  )

  handle = safeRoute({
    input: this.input,

    handle: async ({ payload }) => {
      const page = payload.query.page ?? 1
      const limit = payload.query.limit ?? 10

      let filter: Filter<FormCollectionSchema> = {}

      if (payload.query.deleted) {
        filter = {
          ...filter,
          status: 'deleted',
        }
      } else {
        filter = {
          ...filter,
          status: { $ne: 'deleted' },
        }
      }

      const skip = (page - 1) * limit

      const [list, totalObjects] = await Promise.all([
        Form.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .toArray(),
        Form.countDocuments(filter),
      ])

      return {
        data: list.map(serializeForm),
        meta: {
          page,
          limit,
          total: {
            object: totalObjects,
            page: Math.ceil(totalObjects / limit),
          },
        },
      }
    },
  })
}
