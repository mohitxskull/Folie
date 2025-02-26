import SecureObject from '#models/secure_object'
import { routeController } from '@folie/castle'
import { serializePage } from '@folie/castle/helpers/serialize'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      query: vine.object({
        page: vine.number().min(1).max(100),
      }),
    })
  ),

  handle: async ({ payload, ctx }) => {
    const { user } = ctx.session

    const list = await user
      .related('secureObjects')
      .query()
      .orderBy('updatedAt', 'desc')
      .paginate(payload.query.page, 50)

    return serializePage(list, SecureObject.serialize)
  },
})
