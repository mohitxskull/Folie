import { setting } from '#config/setting'
import Session from '#models/session'
import User from '#models/user'
import { GmailSchema, PasswordSchema } from '#validators/index'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
import limiter from '@adonisjs/limiter/services/main'
import mail from '@adonisjs/mail/services/main'
import EmailVerificationMail from '#mails/email_verification'
import { handler } from '@folie/castle/helpers'
import { BadRequestException, ForbiddenException, OkException } from '@folie/castle/exception'

export default class Controller {
  input = vine.compile(
    vine.object({
      email: GmailSchema(),
      password: PasswordSchema(),
    })
  )

  handle = handler(async ({ ctx }) => {
    if (!setting.signIn.enabled) {
      throw new ForbiddenException('Sign-in is disabled')
    }

    const payload = await ctx.request.validateUsing(this.input)

    const user = await User.findBy('email', payload.email)

    if (!user) {
      await hash.make(payload.password)

      throw new BadRequestException('Invalid credentials', {
        reason: {
          email: payload.email,
          message: "User doesn't exist",
        },
      })
    }

    if (!(await hash.verify(user.password, payload.password))) {
      throw new BadRequestException('Invalid credentials', {
        reason: {
          email: payload.email,
          message: 'Invalid password',
        },
      })
    }

    if (!user.verifiedAt) {
      if (!setting.signUp.verification.enabled) {
        throw new ForbiddenException('Email not verified', {
          source: 'email',
        })
      }

      const mailLimiter = limiter.use({
        requests: 3,
        duration: '1 hour',
      })

      const key = `resend_verification_mail_${user.id}`

      const mailRes = await mailLimiter.attempt(key, async () => {
        return mail.send(new EmailVerificationMail(user))
      })

      if (!mailRes) {
        const availableIn = await mailLimiter.availableIn(key)

        throw new ForbiddenException(
          `You have exceeded the rate limit for sending verification emails. Please try again in ${availableIn} seconds.`,
          {
            source: 'email',
          }
        )
      }

      throw new OkException("We've sent you an email to verify your account.", {
        source: 'email',
      })
    }

    const session = await Session.manager.create(user)

    return {
      token: session.value.release(),
      message: `You have successfully signed in!`,
    }
  })
}
