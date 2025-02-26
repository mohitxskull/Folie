import { setting } from '#config/setting'
import EmailVerificationMail from '#mails/email_verification'
import User from '#models/user'
import { GmailSchema, PasswordSchema } from '#validators/index'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { TextSchema } from '@folie/castle/validator/index'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import { acceptablePassword } from '#helpers/acceptable_password'
import db from '@adonisjs/lucid/services/db'

export default routeController({
  input: vine.compile(
    vine.object({
      firstName: TextSchema,
      lastName: TextSchema,
      email: GmailSchema,
      password: PasswordSchema,
      confirmPassword: PasswordSchema.sameAs('password'),
    })
  ),

  handle: async ({ payload }) => {
    if (!setting.signUp.enabled) {
      throw new ProcessingException('Sign-up is disabled')
    }

    const exist = await User.findBy('email', payload.email)

    if (exist) {
      throw new ProcessingException('Email already exists', {
        source: 'email',
      })
    }

    const passRes = acceptablePassword(payload.password, [
      payload.firstName,
      payload.lastName,
      payload.email,
    ])

    if (!passRes.result) {
      throw new ProcessingException(passRes.reason, {
        source: 'password',
      })
    }

    const trx = await db.transaction()

    try {
      const user = await User.create(
        {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          password: payload.password,
          key: null,
          setting: {
            timeout: 5 * 60, // 5 minutes
          },
          verifiedAt: setting.signUp.verification.enabled ? null : DateTime.utc(),
        },
        {
          client: trx,
        }
      )

      let message = 'You have successfully signed up'

      if (setting.signUp.verification.enabled) {
        await mail.send(new EmailVerificationMail(user))

        message = 'An email has been sent to your email address'
      }

      await trx.commit()

      return {
        message,
      }
    } catch (error) {
      await trx.rollback()

      throw Error('An error occurred while signing up', {
        cause: error,
      })
    }
  },
})
