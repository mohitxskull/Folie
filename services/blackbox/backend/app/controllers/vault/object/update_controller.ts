import { squid } from '#config/squid'
import { SecureObjectType } from '#types/enum'
import { SimpleSecureObjectValueSchema, TagSecureObjectValueSchema } from '#validators/index'
import { routeController } from '@folie/castle'
import ProcessingException from '@folie/castle/exception/processing_exception'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      params: vine.object({
        secretObjectId: squid.SECURE_OBJECT.schema,
      }),
      version: vine.number().min(1).max(1000),
      type: vine.enum(SecureObjectType.keys).nullable(),
      value: vine
        .union([
          vine.union.if((v) => v.type === null, SimpleSecureObjectValueSchema),
          vine.union.if(
            (v) => vine.helpers.isString(v.type) && v.type === SecureObjectType.key('TAG'),
            TagSecureObjectValueSchema
          ),
        ])
        .otherwise((_, field) => {
          field.report('Invalid secure object type', 'invalid_secure_object', field)
        }),
    })
  ),

  handle: async ({ payload, ctx }) => {
    const { user } = ctx.session

    const secureObject = await user
      .related('secureObjects')
      .query()
      .where('id', payload.params.secretObjectId)
      .first()

    if (!secureObject) {
      throw new ProcessingException('Secure object not found')
    }

    if (secureObject.type !== payload.type) {
      throw new ProcessingException('Secure object type does not match', {
        source: 'type',
      })
    }

    if (secureObject.version >= payload.version) {
      throw new ProcessingException('Secure object version is outdated', {
        source: 'version',
      })
    }

    secureObject.value = payload.value
    secureObject.version = payload.version

    await secureObject.save()

    return { secureObject: secureObject.$serialize() }
  },
})
