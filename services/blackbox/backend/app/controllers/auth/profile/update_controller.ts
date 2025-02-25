import { routeController } from '@folie/castle'
import { TextSchema } from '@folie/castle/validator/index'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      firstName: TextSchema.optional(),
      lastName: TextSchema.optional(),
    })
  ),

  handle: async ({ ctx, payload }) => {
    const { user } = ctx.session

    if (payload.firstName) {
      user.firstName = payload.firstName
    }

    if (payload.lastName) {
      user.lastName = payload.lastName
    }

    await user.save()

    return { user: user.$serialize(), message: 'Your profile has been updated' }
  },
})
