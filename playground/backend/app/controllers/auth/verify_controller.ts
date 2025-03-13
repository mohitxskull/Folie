import { setting } from '#config/setting'
import vine from '@vinejs/vine'
import encryption from '@adonisjs/core/services/encryption'
import User from '#models/user'
import { DateTime } from 'luxon'
import { handler } from '@folie/castle/helpers'
import { ProcessingException } from '@folie/castle/exception'

export default class Controller {
  input = vine.compile(
    vine.object({
      token: vine.string().minLength(150).maxLength(300),
    })
  )

  handle = handler(async ({ ctx }) => {
    if (!setting.signUp.verification.enabled) {
      throw new ProcessingException('Email verification is disabled', {
        status: 'FORBIDDEN',
      })
    }

    const payload = await ctx.request.validateUsing(this.input)

    const decryptedToken = encryption.decrypt<{ email: string }>(
      payload.token,
      setting.signUp.verification.purpose
    )

    if (!decryptedToken) {
      throw new ProcessingException('Invalid token', {
        meta: {
          reason: 'Token decryption failed',
        },
      })
    }

    const user = await User.findBy('email', decryptedToken.email)

    if (!user) {
      throw new ProcessingException('Invalid token', {
        meta: {
          reason: 'User not found',
        },
      })
    }

    if (user.verifiedAt) {
      throw new ProcessingException('Invalid token', {
        meta: {
          reason: 'User already verified',
        },
      })
    }

    user.verifiedAt = DateTime.utc()

    await user.save()

    return {
      message: 'Email verified successfully',
    }
  })
}
