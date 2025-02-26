import { setting } from '#config/setting'
import User from '#models/user'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import router from '@adonisjs/core/services/router'
import { BaseMail } from '@adonisjs/mail'
import encryption from '@adonisjs/core/services/encryption'

export default class EmailVerificationMail extends BaseMail {
  subject = 'Verify your email'

  constructor(private user: User) {
    super()
  }

  prepare() {
    const encryptedToken = encryption.encrypt(
      { email: this.user.email },
      setting.signUp.verification.expiresIn,
      setting.signUp.verification.purpose
    )

    const url = router
      .builder()
      .disableRouteLookup()
      .prefixUrl(new URL(env.get('APP_URL')).origin)
      .qs({ token: encryptedToken })
      .make('/verify')

    logger.debug({ url }, `Verify email for user ${this.user.id}`)

    this.message.to(this.user.email)
    this.message.htmlView('emails/email_verification', {
      url,
    })
  }
}
