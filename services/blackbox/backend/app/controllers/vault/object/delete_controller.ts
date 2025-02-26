import { squid } from '#config/squid'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      params: vine.object({
        secretObjectId: squid.SECURE_OBJECT.schema,
      }),
    })
  ),

  handle: async ({ payload, ctx }) => {
    const { user } = ctx.session

    const secureObject = await user
      .related('secureObjects')
      .query()
      .where('id', payload.params.secretObjectId)
      .first()

    if (!secureObject) {
      throw new ProcessingException('Secure object not found')
    }

    await Promise.all([secureObject.delete(), user.cache().expire('metric')])

    return { secureObject: secureObject.$serialize() }
  },
})
