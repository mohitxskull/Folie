import { setting } from '#config/setting'
import { TagDescriptionSchema, TagNameSchema } from '#validators/index'
import { ProcessingException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'

export default class Controller {
  input = vine.compile(
    vine.object({
      name: TagNameSchema,
      description: TagDescriptionSchema.optional(),
    })
  )

  handle = handler(async ({ ctx }) => {
    const [payload, user] = await Promise.all([
      ctx.request.validateUsing(this.input),
      ctx.auth.session.getUser(),
    ])

    const metrics = await user.$metric()

    if (metrics.notes >= setting.notes.perUser) {
      throw new ProcessingException('Maximum notes reached')
    }

    const tag = await user.related('tags').create({
      name: payload.name,
      description: payload.description,
    })

    return { tag: tag.$serialize() }
  })
}
