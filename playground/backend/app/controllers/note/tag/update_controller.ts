import { setting } from '#config/setting'
import { squid } from '#config/squid'
import Note from '#models/note'
import Tag from '#models/tag'
import { ProcessingException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        noteId: squid.note.schema,
      }),
      tagId: squid.tag.schema,
      action: vine.enum(['add', 'remove']),
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

    const isTagPresent = (tagIdToCheck: number) => note.tags.some((tag) => tag.id === tagIdToCheck)

    if (payload.action === 'add') {
      if (note.tags.length >= setting.tags.perNote) {
        throw new ProcessingException(`Only ${setting.tags.perNote} tags allowed per note`, {
          status: 'BAD_REQUEST',
        })
      }

      if (isTagPresent(payload.tagId)) {
        throw new ProcessingException('Tag already added')
      }

      const exist = await Tag.query().where('userId', userId).andWhere('id', payload.tagId).first()

      if (!exist) {
        throw new ProcessingException('Tag not found')
      }

      note.updatedAt = DateTime.utc()

      await Promise.all([
        note.related('tags').attach([payload.tagId]),
        note.save(),
        exist.$cache().expire('metric'),
      ])

      return { message: 'Tag added successfully' }
    } else {
      if (!isTagPresent(payload.tagId)) {
        throw new ProcessingException('Tag not found')
      }

      note.updatedAt = DateTime.utc()

      await Promise.all([
        note.related('tags').detach([payload.tagId]),
        note.save(),
        Tag.$cache().expire({
          id: payload.tagId,
          key: 'metric',
        }),
      ])

      return { message: 'Tag removed successfully' }
    }
  })
}
