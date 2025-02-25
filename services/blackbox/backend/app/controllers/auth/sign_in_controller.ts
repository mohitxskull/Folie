import { setting } from '#config/setting'
import Session from '#models/session'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { EmailSchema, PasswordSchema } from '@folie/castle/validator/index'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      email: EmailSchema,
      password: PasswordSchema,
    })
  ),

  handle: async ({ payload }) => {
    if (!setting.get('SIGNIN_ENABLED')) {
      throw new ProcessingException('Sign in is disabled')
    }

    const user = await User.findBy('email', payload.email)

    if (!user) {
      await hash.make(payload.password)

      throw new ProcessingException('Invalid credentials', {
        meta: {
          email: payload.email,
          message: "User doesn't exist",
        },
      })
    }

    if (!(await hash.verify(user.password, payload.password))) {
      throw new ProcessingException('Invalid credentials', {
        meta: {
          email: payload.email,
          message: 'Invalid password',
        },
      })
    }

    const tokens = await Session.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .limit(4)

    if (tokens.length > 3) {
      await tokens[3].delete()
    }

    const token = Session.$.draft(user.id, '7d')

    await token.save()

    const tokenValue = token.value()

    if (!tokenValue) {
      throw new ProcessingException('Failed to create token', {
        meta: {
          reason: 'Token value was null',
        },
      })
    }

    return {
      token: tokenValue.release(),
      message: `You have successfully logged in!`,
    }
  },
})
