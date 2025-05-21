import { setting } from '#config/setting'
import { TagDescriptionSchema, TagNameSchema } from '#validators/index'
import { ConflictException, ForbiddenException } from '@folie/castle/exception'
import { handler, slugify } from '@folie/castle/helpers'
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

    const metrics = await user.$metric().get()

    if (metrics.notes >= setting.notes.perUser) {
      throw new ForbiddenException('Maximum notes reached')
    }

    const slug = slugify(payload.name)

    const exist = await user.related('tags').query().where('slug', slug).first()

    if (exist) {
      throw new ConflictException('Tag already exists', {
        source: 'name',
      })
    }

    const tag = await user.related('tags').create({
      slug,
      name: payload.name,
      description: payload.description,
    })

    return { tag: tag.$serialize(), message: `Tag "${tag.name}" created successfully` }
  })
}
