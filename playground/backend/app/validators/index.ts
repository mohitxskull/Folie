import { setting } from '#config/setting'
import vine from '@vinejs/vine'

export const NameSchema = () => vine.string().minLength(2).maxLength(100).clone()

export const GmailSchema = () =>
  vine
    .string()
    .trim()
    .email({
      host_whitelist: ['gmail.com'],
    })
    .normalizeEmail()
    .clone()

export const PasswordSchema = () =>
  vine
    .string()
    .minLength(setting.passwordRequirement.size.min)
    .maxLength(setting.passwordRequirement.size.max)
    .clone()

export const NoteTitleSchema = () => vine.string().minLength(1).maxLength(100).clone()

export const NoteBodySchema = () => vine.string().minLength(1).maxLength(10000).clone()

export const TagNameSchema = () => vine.string().minLength(1).maxLength(20).clone()

export const TagDescriptionSchema = () => vine.string().minLength(1).maxLength(100).clone()
