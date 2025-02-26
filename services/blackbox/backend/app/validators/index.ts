import { setting } from '#config/setting'
import { EmailSchema } from '@folie/castle/validator/index'
import vine from '@vinejs/vine'

export const GmailSchema = EmailSchema({
  host_whitelist: ['gmail.com'],
})

export const PasswordSchema = vine
  .string()
  .minLength(setting.passwordRequirement.size.min)
  .maxLength(setting.passwordRequirement.size.max)

export const SimpleSecureObjectValueSchema = vine
  .string()
  .minLength(1)
  .maxLength(setting.secureObject.simple.maxSize)

export const TagSecureObjectValueSchema = vine
  .string()
  .minLength(1)
  .maxLength(setting.secureObject.tag.maxSize)

export const SecureKeySchema = vine
  .string()
  .minLength(setting.secureKey.minSize)
  .maxLength(setting.secureKey.maxSize)
