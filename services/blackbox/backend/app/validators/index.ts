import { setting } from '#config/setting'
import { EmailSchema } from '@folie/castle/validator/index'
import vine from '@vinejs/vine'

export const GmailSchema = EmailSchema({
  host_whitelist: ['gmail.com'],
})

export const PasswordSchema = vine
  .string()
  .minLength(setting.passwordRequirement.length.min)
  .maxLength(setting.passwordRequirement.length.max)
