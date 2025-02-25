import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'sparkpost',

  from: 'blackbox.mohitxskull@gmail.com',

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  mailers: {
    sparkpost: transports.sparkpost({
      key: env.get('SPARKPOST_API_KEY'),
      baseUrl: 'https://api.sparkpost.com/api/v1',
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
