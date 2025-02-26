import { setting } from '#config/setting'
import { SecureObjectType } from '#types/enum'
import {
  SecureKeySchema,
  SimpleSecureObjectValueSchema,
  TagSecureObjectValueSchema,
} from '#validators/index'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      key: SecureKeySchema,
      type: vine.enum(SecureObjectType.keys).nullable(),
      value: vine
        .union([
          vine.union.if((v) => v.type === null, SimpleSecureObjectValueSchema),
          vine.union.if((v) => v.type === SecureObjectType.key('TAG'), TagSecureObjectValueSchema),
        ])
        .otherwise((_, field) => {
          field.report('Invalid secure object type', 'invalid_secure_object', field)
        }),
    })
  ),

  handle: async ({ payload, ctx }) => {
    const { user } = ctx.session

    const metrics = await user.$metric()

    let limitReached = false

    if (
      payload.type === null &&
      metrics.simpleObjectCount >= setting.secureObject.simple.maxCount
    ) {
      limitReached = true
    }

    if (payload.type === 'TAG' && metrics.tagObjectCount >= setting.secureObject.tag.maxCount) {
      limitReached = true
    }

    if (limitReached) {
      throw new ProcessingException("You can't create more simple objects", {
        meta: {
          metrics,
          secureObjectSetting: setting.secureObject,
        },
      })
    }

    const [secureObject] = await Promise.all([
      user.related('secureObjects').create({
        value: payload.value,
        key: payload.key,
        type: payload.type,
        version: 0,
      }),
      user.cache().expire('metric'),
    ])

    return { secureObject: secureObject.$serialize() }
  },
})
