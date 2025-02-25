import { setting } from '#config/setting'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import vine from '@vinejs/vine'
import encryption from '@adonisjs/core/services/encryption'
import User from '#models/user'
import { DateTime } from 'luxon'

export default routeController({
  input: vine.compile(
    vine.object({
      token: vine.string().minLength(20).maxLength(1000),
    })
  ),

  handle: async ({ payload }) => {
    if (!setting.signUp.verification.enabled) {
      throw new ProcessingException('Email verification is disabled')
    }

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
  },
})
