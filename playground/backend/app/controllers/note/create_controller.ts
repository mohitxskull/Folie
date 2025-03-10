import { setting } from '#config/setting'
import { NoteBodySchema, NoteTitleSchema } from '#validators/index'
import { ProcessingException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'

export default class Controller {
  input = vine.compile(
    vine.object({
      title: NoteTitleSchema,
      body: NoteBodySchema,
    })
  )

  handle = handler(async ({ getPayload, ctx }) => {
    const [payload, user] = await Promise.all([getPayload(this.input), ctx.auth.session.getUser()])

    const metrics = await user.$metric()

    if (metrics.notes >= setting.notes.perUser) {
      throw new ProcessingException('Maximum notes reached')
    }

    const note = await user.related('note').create({
      title: payload.title,
      body: payload.body,
    })

    return { note: note.$serialize(), message: 'Note created successfully' }
  })
}
