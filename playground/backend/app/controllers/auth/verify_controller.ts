import { setting } from '#config/setting'
import vine from '@vinejs/vine'
import encryption from '@adonisjs/core/services/encryption'
import User from '#models/user'
import { DateTime } from 'luxon'
import { handler } from '@folie/castle/helpers'
import { BadRequestException, ForbiddenException } from '@folie/castle/exception'

export default class Controller {
  input = vine.compile(
    vine.object({
      token: vine.string().minLength(150).maxLength(300),
    })
  )

  handle = handler(async ({ ctx }) => {
    if (!setting.signUp.verification.enabled) {
      throw new ForbiddenException('Email verification is disabled')
    }

    const payload = await ctx.request.validateUsing(this.input)

    const decryptedToken = encryption.decrypt<{ email: string }>(
      payload.token,
      setting.signUp.verification.purpose
    )

    if (!decryptedToken) {
      throw new BadRequestException('Invalid token', {
        reason: 'Token decryption failed',
      })
    }

    const user = await User.findBy('email', decryptedToken.email)

    if (!user) {
      throw new BadRequestException('Invalid token', {
        reason: 'User not found',
      })
    }

    if (user.verifiedAt) {
      throw new BadRequestException('Invalid token', {
        reason: 'User already verified',
      })
    }

    user.verifiedAt = DateTime.now()

    await user.save()

    return {
      message: 'Email verified successfully',
    }
  })
}
