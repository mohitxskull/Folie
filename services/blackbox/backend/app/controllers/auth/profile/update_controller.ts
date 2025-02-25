import { routeController } from '@folie/castle'
import { TextSchema } from '@folie/castle/validator/index'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      firstName: TextSchema.optional(),
      lastName: TextSchema.optional(),
      timeout: vine.number().min(0).max(3600).nullable().optional(),
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

    if (payload.timeout !== undefined) {
      user.timeout = payload.timeout
    }

    await user.save()

    return { user: user.$serialize(), message: 'Your profile has been updated' }
  },
})
