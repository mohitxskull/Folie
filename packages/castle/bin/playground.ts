import { z } from 'zod'
import { VineZod } from '../src/providers/vine_zod_schema_provider.js'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

console.log('Welcome to playground!')

const zSchema = z.object({
  email: z.string().email(),
  age: z.number(),
})

const rootObjSchema = new VineZod(zSchema)

const objSchema = vine.object({
  user: rootObjSchema,
})

const rootArrSchema = new VineZod(z.array(zSchema))

const arrSchema = vine.object({
  users: rootArrSchema,
})

const data: Infer<typeof rootObjSchema> = {
  email: 'goatgmail.com',
  age: 15,
}

const rootObjSchemaResult = await vine.tryValidate({
  schema: rootObjSchema,
  data,
})

console.log(rootObjSchemaResult[0]?.messages, rootObjSchemaResult[1])
console.log('')

const objSchemaResult = await vine.tryValidate({
  schema: objSchema,
  data: { user: data },
})

console.log(objSchemaResult[0]?.messages, objSchemaResult[1])
console.log('')

const rootArrSchemaResult = await vine.tryValidate({
  schema: rootArrSchema,
  data: [{ user: data }],
})

console.log(rootArrSchemaResult[0]?.messages, rootArrSchemaResult[1])

console.log('')

const arrSchemaResult = await vine.tryValidate({
  schema: arrSchema,
  data: { users: [{ user: data }] },
})

console.log(arrSchemaResult[0]?.messages, arrSchemaResult[1])
