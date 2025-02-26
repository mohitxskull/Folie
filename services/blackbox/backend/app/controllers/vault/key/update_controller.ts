import { SecureKeySchema } from '#validators/index'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      key: SecureKeySchema,
    })
  ),

  handle: async ({ payload, ctx }) => {
    const { user } = ctx.session

    if (user.key) {
      throw new ProcessingException('Key has been already set')
    }

    user.key = payload.key

    await user.save()

    return { message: 'Key updated successfully' }
  },
})
