import { setting } from '#config/setting'
import { squid } from '#config/squid'
import Note from '#models/note'
import Tag from '#models/tag'
import { ConflictException, ForbiddenException, NotFoundException } from '@folie/castle/exception'
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

    const { ownerId: userId } = ctx.auth.session

    const note = await Note.query()
      .where('id', payload.params.noteId)
      .andWhere('userId', userId)
      .preload('tags', (ta) => {
        ta.limit(setting.tags.perUser)
      })
      .first()

    if (!note) {
      throw new NotFoundException('Note not found')
    }

    const isTagPresent = (tagIdToCheck: number) => note.tags.some((tag) => tag.id === tagIdToCheck)

    if (payload.action === 'add') {
      if (note.tags.length >= setting.tags.perNote) {
        throw new ForbiddenException(`Only ${setting.tags.perNote} tags allowed per note`)
      }

      if (isTagPresent(payload.tagId)) {
        throw new ConflictException('Tag already added')
      }

      const exist = await Tag.query().where('userId', userId).andWhere('id', payload.tagId).first()

      if (!exist) {
        throw new NotFoundException('Tag not found')
      }

      note.updatedAt = DateTime.now()

      await Promise.all([
        note.related('tags').attach([payload.tagId]),
        note.save(),
        exist.$metric().delete(),
      ])

      return { message: 'Tag added successfully' }
    } else {
      if (!isTagPresent(payload.tagId)) {
        throw new NotFoundException('Tag not found')
      }

      note.updatedAt = DateTime.now()

      await Promise.all([
        note.related('tags').detach([payload.tagId]),
        note.save(),
        new Tag().fill({ id: payload.tagId }).$metric().delete(),
      ])

      return { message: 'Tag removed successfully' }
    }
  })
}
