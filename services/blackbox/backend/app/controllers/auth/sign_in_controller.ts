import { setting } from '#config/setting'
import Session from '#models/session'
import User from '#models/user'
import { GmailSchema, PasswordSchema } from '#validators/index'
import hash from '@adonisjs/core/services/hash'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import vine from '@vinejs/vine'
import limiter from '@adonisjs/limiter/services/main'
import mail from '@adonisjs/mail/services/main'
import EmailVerificationMail from '#mails/email_verification'

export default routeController({
  input: vine.compile(
    vine.object({
      email: GmailSchema,
      password: PasswordSchema,
    })
  ),

  handle: async ({ payload }) => {
    if (!setting.signIn.enabled) {
      throw new ProcessingException('Sign-in is disabled')
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

    if (!user.verifiedAt) {
      if (!setting.signUp.verification.enabled) {
        throw new ProcessingException('Email not verified', {
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

        throw new ProcessingException(
          `You have exceeded the rate limit for sending verification emails. Please try again in ${availableIn} seconds.`,
          {
            source: 'email',
          }
        )
      }

      throw new ProcessingException("We've sent you an email to verify your account.", {
        source: 'email',
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
      throw new Error('Token value was null')
    }

    return {
      token: tokenValue.release(),
      message: `You have successfully logged in!`,
    }
  },
})
