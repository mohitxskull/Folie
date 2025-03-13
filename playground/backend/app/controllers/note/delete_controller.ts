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
      throw new ProcessingException('Note not found', {
        status: 'NOT_FOUND',
      })
    }

    await note.delete()

    return {
      note: note.$serialize(),
      message: 'Note deleted successfully',
    }
  })
}
