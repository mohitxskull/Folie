import { squid } from '#config/squid'
import Note from '#models/note'
import { NotFoundException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        noteId: squid.note.schema,
      }),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    const { userId } = ctx.auth.session

    const note = await Note.query()
      .where('id', payload.params.noteId)
      .andWhere('userId', userId)
      .first()

    if (!note) {
      throw new NotFoundException('Note not found')
    }

    await note.delete()

    return {
      note: note.$serialize(),
      message: `Note "${note.title}" deleted successfully`,
    }
  })
}
