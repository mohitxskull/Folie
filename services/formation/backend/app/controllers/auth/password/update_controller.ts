import hash from '@adonisjs/core/services/hash'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { PasswordSchema } from '@folie/castle/validator/index'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      oldPassword: PasswordSchema,
      newPassword: PasswordSchema,
    })
  ),

  handle: async ({ payload, ctx }) => {
    const { user } = ctx.session

    if (payload.oldPassword === payload.newPassword) {
      throw new ProcessingException('Password is the same')
    }

    if (!(await hash.verify(user.password, payload.oldPassword))) {
      throw new ProcessingException('Invalid password', {
        source: 'oldPassword',
      })
    }

    user.password = payload.newPassword

    await user.save()

    return {
      message: 'You have successfully updated your password',
    }
  },
})
