import vine, { Vine } from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import { BaseLiteralType, symbols } from '@vinejs/vine'
import type { FieldOptions, Validation } from '@vinejs/vine/types'
import { z, ZodIssueCode } from 'zod'
import { ApplicationService } from '@adonisjs/core/types'
import stringHelpers from '@adonisjs/core/helpers/string'

type VineZodSchema = z.ZodType

const fieldPath = (field: FieldContext, path: (string | number)[]) => {
  const rootPath = field.getFieldPath()

  const rootPathLen = rootPath.length
  const pathLen = path.length

  if (rootPathLen < 1 && pathLen < 1) {
    return ''
  }

  if (rootPathLen < 1) {
    return path.join('.')
  }

  return [rootPath, ...path].join('.')
}

const vineZod = vine.createRule((value: unknown, schema: VineZodSchema, field: FieldContext) => {
  if (!vine.helpers.isObject(value) && !vine.helpers.isArray(value)) {
    field.report(
      'The {{ field }} must be an object or array',
      stringHelpers.camelCase(ZodIssueCode.invalid_type),
      field
    )
    return
  }

  const result = schema.safeParse(value)

  if (!result.success) {
    for (const issue of result.error.issues) {
      field.getFieldPath()
      field.report(issue.message, stringHelpers.camelCase(issue.code), {
        ...field,
        getFieldPath: () => fieldPath(field, issue.path),
      })
    }
    return
  }

  field.mutate(result.data, field)
})

const VINE_ZOD: typeof symbols.SUBTYPE = symbols.SUBTYPE ?? Symbol.for('subtype')

export class VineZod<S extends VineZodSchema = VineZodSchema> extends BaseLiteralType<
  z.infer<S>,
  z.infer<S>,
  z.infer<S>
> {
  #schema: S;

  [VINE_ZOD] = 'vineZod'

  constructor(schema: S, options?: FieldOptions, validations?: Validation<any>[]) {
    super(options, validations || [vineZod(schema)])

    this.#schema = schema
  }

  clone() {
    return new VineZod(this.#schema, this.cloneOptions(), this.cloneValidations()) as this
  }
}

declare module '@vinejs/vine' {
  interface Vine {
    zod<S extends VineZodSchema>(schema: S): VineZod<S>
  }
}

export default class VineZodSchemaProvider {
  constructor(protected app: ApplicationService) {
    this.app.usingVineJS = true
  }

  boot() {
    Vine.macro('zod', function <S extends VineZodSchema>(this: Vine, options: S) {
      return new VineZod(options)
    })
  }
}
