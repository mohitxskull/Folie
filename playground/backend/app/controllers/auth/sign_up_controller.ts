import { setting } from '#config/setting'
import EmailVerificationMail from '#mails/email_verification'
import User from '#models/user'
import { GmailSchema, NameSchema, PasswordSchema } from '#validators/index'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import { acceptablePassword } from '#helpers/acceptable_password'
import db from '@adonisjs/lucid/services/db'
import { handler } from '@folie/castle/helpers'
import { BadRequestException, ConflictException, ForbiddenException } from '@folie/castle/exception'

export default class Controller {
  input = vine.compile(
    vine.object({
      firstName: NameSchema(),
      lastName: NameSchema(),
      email: GmailSchema(),
      password: PasswordSchema(),
      confirmPassword: PasswordSchema().sameAs('password'),
    })
  )

  handle = handler(async ({ ctx }) => {
    if (!setting.signUp.enabled) {
      throw new ForbiddenException('Sign-up is disabled')
    }

    const payload = await ctx.request.validateUsing(this.input)

    const exist = await User.findBy('email', payload.email)

    if (exist) {
      throw new ConflictException('Email already exists')
    }

    const passRes = acceptablePassword(payload.password, [
      payload.firstName,
      payload.lastName,
      payload.email,
    ])

    if (!passRes.result) {
      throw new BadRequestException(passRes.reason, {
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
          verifiedAt: setting.signUp.verification.enabled ? null : DateTime.now(),
        },
        {
          client: trx,
        }
      )

      let message = 'You have successfully signed up!'

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

      throw error
    }
  })
}
