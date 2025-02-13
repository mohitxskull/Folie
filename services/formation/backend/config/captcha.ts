import env from '#start/env'
import { Secret } from '@adonisjs/core/helpers'
import { CaptchaService } from '@folie/castle/service/captcha_service'

export const captcha = new CaptchaService({
  privateKey: new Secret(env.get('CAPTCHA_PRIVATE_KEY')),
})
