import { z, ZodType } from 'zod'
import { pathExists, readFileOptional, writeFileToPath } from '../fs.js'

export class JSONFile<SCHEMA extends ZodType<any, any>> {
  #name: string
  #path: string
  #schema: SCHEMA
  #data?: z.infer<SCHEMA>

  get data() {
    if (!this.#data) {
      throw new Error('Package JSON has not been loaded')
    }

    return this.#data
  }

  set data(data: z.infer<SCHEMA>) {
    this.#data = data
  }

  constructor(name: string, schema: SCHEMA, path: string) {
    if (!pathExists(path)) {
      throw new Error(`${name} File: Path "${path}" does not exist`)
    }

    this.#name = name
    this.#path = path
    this.#schema = schema
  }

  async sync() {
    const data = await readFileOptional(this.#path)

    if (!data) {
      return
    }

    const parsedData = this.#schema.safeParse(JSON.parse(data))

    if (!parsedData.success) {
      throw new Error(parsedData.error.message)
    }

    this.#data = parsedData.data
  }

  async save() {
    if (!this.#data) {
      throw new Error(`${this.#name} File: Data has not been loaded`)
    }

    const res = await writeFileToPath(this.#path, JSON.stringify(this.#data, null, 2))

    if (!res.success) {
      throw new Error(res.reason)
    }

    return res
  }

  toJSON() {
    return this.#data
  }
}
