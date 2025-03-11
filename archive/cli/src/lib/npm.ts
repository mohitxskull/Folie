import axios from 'axios'
import { z } from 'zod'

const schema = z.object({
  'dist-tags': z.object({
    latest: z.string(),
  }),
})

export class NPM {
  #client = axios.create({
    baseURL: 'https://registry.npmjs.org',
    timeout: 10000,
  })

  async reachable() {
    try {
      await this.#client.get('/')

      return true
    } catch (error) {
      return false
    }
  }

  async version(packageName: string): Promise<
    | {
        success: true
        data: string
      }
    | {
        success: false
        reason: string
      }
  > {
    try {
      const reachable = await this.reachable()

      if (!reachable) {
        return {
          success: false,
          reason: 'NPM is not reachable',
        }
      }

      const res = await this.#client.get(`/${packageName}`)

      const parsedData = schema.safeParse(res.data)

      if (!parsedData.success) {
        return {
          success: false,
          reason: parsedData.error.message,
        }
      }

      return {
        success: true,
        data: parsedData.data['dist-tags'].latest,
      }
    } catch (error) {
      return {
        success: false,
        reason: error.message,
      }
    }
  }
}
