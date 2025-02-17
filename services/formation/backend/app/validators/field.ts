import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

const BaseSchema = {
  key: vine.number().positive().min(0).max(100).optional(),
  name: vine.string().minLength(1).maxLength(20),
  deleted: vine.boolean().optional(),
}

const StringEmailSchema = {
  type: vine.literal('email'),
  options: vine
    .object({
      allow_display_name: vine.boolean().optional(),
      require_display_name: vine.boolean().optional(),
      allow_utf8_local_part: vine.boolean().optional(),
      require_tld: vine.boolean().optional(),
      ignore_max_length: vine.boolean().optional(),
      allow_ip_domain: vine.boolean().optional(),
      domain_specific_validation: vine.boolean().optional(),
      allow_underscores: vine.boolean().optional(),
      host_blacklist: vine.array(vine.string().minLength(1).maxLength(100)).optional(),
      host_whitelist: vine.array(vine.string().minLength(1).maxLength(100)).optional(),
      blacklisted_chars: vine.string().minLength(1).maxLength(100).optional(),
    })
    .optional(),
}

const StringURLSchema = {
  type: vine.literal('url'),
  options: vine
    .object({
      require_protocol: vine.boolean().optional(),
    })
    .optional(),
}

const StringNoneSchema = {
  type: vine.literal('none'),
}

const StringSchema = {
  ...BaseSchema,
  type: vine.literal('string'),
  options: vine
    .object({
      required: vine.boolean().optional(),
      nullable: vine.boolean().optional(),
      minLength: vine.number().min(0).max(1000).optional(),
      maxLength: vine.number().min(0).max(1000).optional(),
    })
    .optional(),
  sub: vine
    .object({
      type: vine.enum(['email', 'url', 'none']),
    })
    .merge(
      vine.group([
        vine.group.if((data) => data.type === 'email', StringEmailSchema),
        vine.group.if((data) => data.type === 'url', StringURLSchema),
        vine.group.if((data) => data.type === 'none', StringNoneSchema),
      ])
    ),
}

const NumberSchema = {
  ...BaseSchema,
  type: vine.literal('number'),
  options: vine
    .object({
      required: vine.boolean().optional(),
      nullable: vine.boolean().optional(),
      min: vine.number().optional(),
      max: vine.number().optional(),
      positive: vine.boolean().optional(),
      negative: vine.boolean().optional(),
    })
    .optional(),
}

export const FieldSchema = vine
  .object({
    type: vine.enum(['string', 'number']),
  })
  .merge(
    vine.group([
      vine.group.if((data) => data.type === 'string', StringSchema),
      vine.group.if((data) => data.type === 'number', NumberSchema),
    ])
  )

export const FieldArraySchema = vine
  .array(FieldSchema.clone())
  .minLength(1)
  .maxLength(10)
  .distinct('key')

export type FieldSchema = Infer<typeof FieldSchema>

export type DBFieldSchema = FieldSchema & { key: number; slug: string }
