import { squid } from '#config/squid'
import Tag from '#models/tag'
import { NotFoundException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        tagId: squid.tag.schema,
      }),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    const { ownerId: userId } = ctx.auth.session

    const tag = await Tag.query()
      .where('id', payload.params.tagId)
      .andWhere('userId', userId)
      .first()

    if (!tag) {
      throw new NotFoundException('Tag not found')
    }

    return { tag: tag.$serialize() }
  })
}
