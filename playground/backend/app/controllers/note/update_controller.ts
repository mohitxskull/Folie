import { squid } from '#config/squid'
import Note from '#models/note'
import { NoteBodySchema, NoteTitleSchema } from '#validators/index'
import { NotFoundException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        noteId: squid.note.schema,
      }),
      title: NoteTitleSchema().optional(),
      body: NoteBodySchema().optional(),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    const { ownerId: userId } = ctx.auth.session

    const note = await Note.query()
      .where('id', payload.params.noteId)
      .andWhere('userId', userId)
      .first()

    if (!note) {
      throw new NotFoundException('Note not found')
    }

    if (payload.title) {
      note.title = payload.title
    }

    if (payload.body) {
      note.body = payload.body
    }

    await note.save()

    return { note: note.$serialize(), message: `Note "${note.title}" updated successfully` }
  })
}
