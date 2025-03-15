import vine from '@vinejs/vine'
import { PageSchema, LimitSchema, OrderSchema } from '@folie/castle/validator'
import { handler, serializePage } from '@folie/castle/helpers'
import Note from '#models/note'
import { NoteTitleSchema } from '#validators/index'

export default class Controller {
  input = vine.compile(
    vine.object({
      query: vine
        .object({
          page: PageSchema.optional(),
          limit: LimitSchema.optional(),

          order: OrderSchema('createdAt', 'updatedAt', 'title', 'id').optional(),

          filter: vine
            .object({
              title: NoteTitleSchema.optional(),
            })
            .optional(),
        })
        .optional(),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    const { userId } = ctx.auth.session

    // Start building the query to fetch tags
    let listQuery = Note.query().where('userId', userId)

    // Filter by note title if provided
    if (payload.query?.filter?.title) {
      listQuery = listQuery.andWhereLike('title', `%${payload.query.filter.title}%`)
    }

    // Execute the query and paginate results
    const list = await listQuery
      .orderBy(payload.query?.order?.by ?? 'createdAt', payload.query?.order?.dir ?? 'desc')
      .paginate(payload.query?.page ?? 1, payload.query?.limit ?? 10)

    return serializePage(list, (d) => d.$serialize())
  })
}
