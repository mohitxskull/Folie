import vine from '@vinejs/vine'
import { PageSchema, LimitSchema, OrderSchema } from '@folie/castle/validator'
import { handler, serializePage } from '@folie/castle/helpers'
import Note from '#models/note'
import { NoteTitleSchema } from '#validators/index'
import { setting } from '#config/setting'

export default class Controller {
  input = vine.compile(
    vine.object({
      query: vine
        .object({
          page: PageSchema().optional(),
          limit: LimitSchema().optional(),

          order: OrderSchema('createdAt', 'updatedAt', 'title', 'id').optional(),

          filter: vine
            .object({
              value: NoteTitleSchema().optional(),
            })
            .optional(),
        })
        .optional(),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    const { ownerId: userId } = ctx.auth.session

    // Start building the query to fetch tags
    let listQuery = Note.query().where('userId', userId)

    // Filter by note title if provided
    if (payload.query?.filter?.value) {
      const filterValue = payload.query.filter.value

      if (filterValue.startsWith('tag:')) {
        const tagFilterValue = filterValue.slice(4)

        if (tagFilterValue.length > 0) {
          listQuery.andWhereHas('tags', (ta) => {
            ta.whereLike('name', `%${tagFilterValue}%`)
          })
        }
      } else {
        listQuery = listQuery.andWhereLike('title', `%${payload.query.filter.value}%`)
      }
    }

    listQuery = listQuery.preload('tags', (ta) => {
      ta.limit(setting.tags.perNote).orderBy('name', 'asc')
    })

    // Execute the query and paginate results
    const list = await listQuery
      .orderBy(payload.query?.order?.by ?? 'createdAt', payload.query?.order?.dir ?? 'desc')
      .paginate(payload.query?.page ?? 1, payload.query?.limit ?? 10)

    return serializePage(list, (d) => ({
      ...d.$serialize(),
      tags: d.tags.map((tag) => tag.$serialize()),
    }))
  })
}
