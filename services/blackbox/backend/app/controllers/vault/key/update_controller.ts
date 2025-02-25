import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      key: vine.string().minLength(20).maxLength(1000),
    })
  ),

  handle: async ({ payload, ctx: { session } }) => {
    if (session.user.key) {
      throw new ProcessingException('Key has been already set')
    }

    session.user.key = payload.key

    await session.user.save()

    return { message: 'Key updated successfully' }
  },
})
