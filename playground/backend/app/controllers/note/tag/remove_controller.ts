import { setting } from '#config/setting'
import { squid } from '#config/squid'
import Note from '#models/note'
import { ProcessingException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        noteId: squid.note.schema,
      }),
      tagId: squid.tag.schema,
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    const { userId } = ctx.auth.session

    const note = await Note.query()
      .where('id', payload.params.noteId)
      .andWhere('userId', userId)
      .preload('tags', (ta) => {
        ta.limit(setting.tags.perUser)
      })
      .first()

    if (!note) {
      throw new ProcessingException('Note not found', {
        status: 'NOT_FOUND',
      })
    }

    const alreadyRemoved = note.tags.some((tag) => tag.id === payload.tagId)

    if (alreadyRemoved) {
      throw new ProcessingException('Tag already removed')
    }

    await note.related('tags').detach([payload.tagId])

    return { message: 'Tag removed successfully' }
  })
}
