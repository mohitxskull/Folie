import { Secret } from '@adonisjs/core/helpers'
import vine from '@vinejs/vine'
import axios, { type AxiosRequestConfig, AxiosInstance } from 'axios'

const schema = vine.compile(
  vine.object({
    'success': vine.boolean({ strict: true }),
    'error-codes': vine.array(vine.string()),
    'hostname': vine.string().optional(),
    'action': vine.string().optional(),
    'cdata': vine.string().optional(),
    'challenge_ts': vine
      .date({
        formats: ['iso8601'],
      })
      .optional(),
  })
)

export class CaptchaService {
  #privateKey: Secret<string>

  #client: AxiosInstance

  constructor(params: { privateKey: Secret<string> }) {
    this.#privateKey = params.privateKey

    this.#client = axios.create({
      baseURL: 'https://challenges.cloudflare.com/turnstile/v0',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async verify(params: { token: string; ip?: string }) {
    const idempotencyKey = crypto.randomUUID()

    const config: AxiosRequestConfig = {
      method: 'POST',
      data: {
        secret: this.#privateKey.release(),
        response: params.token,
        remoteip: params.ip,
        idempotency_key: idempotencyKey,
      },
      url: '/siteverify',
    }

    try {
      const response = await this.#client.request(config)

      const parsedResponse = await schema.validate(response.data)

      return [parsedResponse.success, parsedResponse] as const
    } catch (error) {
      throw new Error('Captcha verification failed', {
        cause: error,
      })
    }
  }
}
