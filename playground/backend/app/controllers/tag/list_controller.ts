import vine from '@vinejs/vine'
import { PageSchema, LimitSchema, OrderSchema } from '@folie/castle/validator'
import { handler, serializePage } from '@folie/castle/helpers'
import Tag from '#models/tag'
import { squid } from '#config/squid'
import { TagNameSchema } from '#validators/index'

export default class Controller {
  // Define input validation schema
  input = vine.compile(
    vine.object({
      query: vine
        .object({
          page: PageSchema.optional(),
          limit: LimitSchema.optional(),

          // Allow ordering by these fields
          order: OrderSchema('createdAt', 'updatedAt', 'name', 'id').optional(),

          filter: vine
            .object({
              noteId: squid.note.schema.optional(),
              name: TagNameSchema.optional(),
            })
            .optional(),
        })
        .optional(),
    })
  )

  handle = handler(async ({ ctx }) => {
    // Validate the request input
    const payload = await ctx.request.validateUsing(this.input)

    const { userId } = ctx.auth.session

    // Start building the query to fetch tags
    let listQuery = Tag.query().where('userId', userId)

    // Filter by noteId if provided
    if (payload.query?.filter?.noteId) {
      const noteId = payload.query.filter.noteId

      listQuery = listQuery.andWhereHas('notes', (query) => {
        query.where('id', noteId)
      })
    }

    // Filter by tag name if provided
    if (payload.query?.filter?.name) {
      listQuery = listQuery.andWhereLike('name', `%${payload.query.filter.name}%`)
    }

    // Execute the query and paginate results
    const list = await listQuery
      .orderBy(payload.query?.order?.by ?? 'createdAt', payload.query?.order?.dir ?? 'desc')
      .paginate(payload.query?.page ?? 1, payload.query?.limit ?? 10)

    // Serialize and return the paginated results
    return serializePage(list, (d) => d.$serialize())
  })
}
