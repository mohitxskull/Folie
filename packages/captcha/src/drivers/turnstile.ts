import vine from '@vinejs/vine'
import { CaptchaDriverContract } from '../types.js'
import ky from 'ky'

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

export class TurnstileDriver implements CaptchaDriverContract {
  #privateKey: string
  #baseUrl: string = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

  constructor(params: { privateKey: string; baseUrl?: string }) {
    this.#privateKey = params.privateKey
    if (params.baseUrl) {
      this.#baseUrl = params.baseUrl
    }
  }

  async verify(params: { token: string; ip?: string }) {
    const idempotencyKey = crypto.randomUUID()

    try {
      const response = await ky
        .post(this.#baseUrl, {
          json: {
            secret: this.#privateKey,
            response: params.token,
            remoteip: params.ip,
            idempotency_key: idempotencyKey,
          },
        })
        .json()

      const validatedResponse = await schema.validate(response)

      return [validatedResponse.success, validatedResponse] as const
    } catch (error) {
      throw new Error('Captcha verification failed', {
        cause: error,
      })
    }
  }
}
