import vine from '@vinejs/vine'
import { PageSchema, LimitSchema, OrderSchema } from '@folie/castle/validator'
import { handler, serializePage } from '@folie/castle/helpers'
import Note from '#models/note'

export default class Controller {
  input = vine.compile(
    vine.object({
      query: vine.object({
        page: PageSchema.optional(),
        limit: LimitSchema.optional(),

        order: OrderSchema('createdAt', 'updatedAt', 'title', 'id').optional(),
      }),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    const { userId } = ctx.auth.session

    const list = await Note.query()
      .where('userId', userId)
      .orderBy(payload.query.order?.by ?? 'createdAt', payload.query.order?.dir ?? 'desc')
      .paginate(payload.query.page ?? 1, payload.query.limit ?? 10)

    return serializePage(list, (d) => d.$serialize())
  })
}
