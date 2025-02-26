import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import mail from '@adonisjs/mail/services/main'

export default class Playground extends BaseCommand {
  static commandName = 'playground'
  static description = 'Playground for your application'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Welcome to playground!')

    await mail.send((message) => {
      message.subject('Test mail')
      message.to('servicexskull@gmail.com')
      message.text('Test mail')
    })
  }
}
