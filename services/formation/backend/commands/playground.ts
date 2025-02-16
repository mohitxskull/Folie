import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class Playground extends BaseCommand {
  static commandName = 'playground'
  static description = 'Playground for your application'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Welcome to playground!')

    function generateShortId() {
      const characters = 'abcdefghijklmnopqrstuvwxyz'
      const length = Math.floor(Math.random() * 10) + 1 // Length between 1 and 10

      let result = ''

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters.charAt(randomIndex)
      }

      return result
    }

    console.log(generateShortId())
  }
}
