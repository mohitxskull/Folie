import fetch from 'node-fetch'
import { CaptchaResSchema, IPResSchema } from './lib/schema.js'
import { WebhookClient, EmbedBuilder } from 'discord.js'
import { sentenceCase } from 'change-case'

export class DisHook {
  /**
   * Form name, App name Etc
   */
  #name: string

  #hook: WebhookClient

  /**
   * Captcha secret
   */
  #captcha?: string

  #bot: {
    username: string
  }

  constructor(params: {
    name: string
    url: string

    captcha?: string

    bot: {
      username: string
    }
  }) {
    this.#hook = new WebhookClient({
      url: params.url,
    })

    this.#captcha = params.captcha
    this.#name = params.name
    this.#bot = params.bot
  }

  #avatar = () => {
    return `https://api.dicebear.com/9.x/bottts-neutral/webp?seed=${this.#bot.username}`
  }

  #verifyCaptcha = async (token: string): Promise<boolean> => {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${this.#captcha}&response=${token}`,
      {
        method: 'POST',
      }
    )

    const dataRaw = await response.json()

    const data = await CaptchaResSchema.validate(dataRaw)

    return data.success
  }

  #ipInfo = async (ip: string) => {
    const ipInfo = await fetch(`http://ip-api.com/json/${ip}?fields=66846719`)

    if (ipInfo.status === 429) {
      return 'IP-API rate limit reached'
    }

    if (ipInfo.status !== 200) {
      return 'IP-API request failed'
    }

    const dataRaw = await ipInfo.json()

    const [error, data] = await IPResSchema.tryValidate(dataRaw)

    if (error) {
      console.error('IP-API request failed', error)
      return 'IP-API request failed'
    }

    if (!data) {
      console.error('Raw data', { dataRaw })
      return 'IP-API request failed: Data validation failed'
    }

    return data
  }

  send = async (
    payload:
      | {
          type: 'simple'
          value: Record<string, string | string | boolean | null | undefined>
        }
      | {
          type: 'complex'
          value: EmbedBuilder[]
        },
    options?: {
      /**
       * IPV4 address required
       */
      ip?: string
      token?: string
    }
  ): Promise<{
    success: boolean
    message?: string
    error?: unknown
  }> => {
    try {
      if (this.#captcha) {
        if (!options?.token) {
          return {
            success: false,
            message: 'Missing token',
          }
        }

        const valid = await this.#verifyCaptcha(options.token)

        if (!valid) {
          return {
            success: false,
            message: 'Invalid token',
          }
        }
      }

      if (payload.type === 'simple') {
        if (Object.keys(payload.value).length === 0) {
          return {
            success: false,
            message: 'Missing payload',
          }
        }

        if (Object.keys(payload.value).length > 25) {
          return {
            success: false,
            message: 'Payload too large, Max 25 fields',
          }
        }

        await this.#hook.send({
          username: this.#bot.username,
          avatarURL: this.#avatar(),
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: this.#bot.username, iconURL: this.#avatar() })
              .setTitle('Submission')
              .setColor('Blue')
              .setFooter({ text: this.#name })
              .addFields(
                Object.entries(payload.value).map(([key, value]) => ({
                  name: sentenceCase(key),
                  value: String(value),
                  inline: true,
                }))
              )
              .setTimestamp(),
          ],
        })
      }

      if (payload.type === 'complex') {
        await this.#hook.send({
          username: this.#bot.username,
          avatarURL: this.#avatar(),
          embeds: payload.value.map((embed) => {
            return embed
              .setAuthor({ name: this.#bot.username, iconURL: this.#avatar() })
              .setFooter({ text: this.#name })
              .setTimestamp()
          }),
        })
      }

      if (options?.ip) {
        const ipInfo = await this.#ipInfo(options.ip)

        const IPEmbed = new EmbedBuilder()
          .setAuthor({ name: this.#bot.username, iconURL: this.#avatar() })
          .setTitle(options.ip)
          .setDescription('IP Information')
          .setFooter({ text: this.#name })
          .setTimestamp()

        if (typeof ipInfo !== 'string') {
          IPEmbed.setColor('Blue')

          IPEmbed.data.fields = Object.entries(ipInfo).map(([key, value]) => ({
            name: sentenceCase(key),
            value: String(value),
            inline: true,
          }))
        } else {
          IPEmbed.setColor('Red')

          IPEmbed.addFields({
            name: 'Error',
            value: ipInfo,
          })
        }

        await this.#hook.send({
          username: this.#bot.username,
          avatarURL: this.#avatar(),
          embeds: [IPEmbed],
        })
      }

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Unknown error',
        error,
      }
    }
  }
}
