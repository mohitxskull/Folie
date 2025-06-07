import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import vine from '@vinejs/vine'
import { z } from 'zod'

export default class Playground extends BaseCommand {
  static commandName = 'playground'
  static description = 'Playground for your application'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Welcome to playground!')

    const res = vine.validate({
      schema: vine.object({
        user: vine.zod(
          z.object({
            name: z.string().min(2).max(10).describe('Name of the user'),
            age: z.number().positive().min(18).max(100).describe('Age of the user'),
          })
        ),
        goat: vine.object({
          name: vine.string().minLength(5).maxLength(100),
          age: vine.number().positive().min(18).max(100),
        }),
      }),
      data: {
        user: {
          name: 's',
        },
        goat: {
          name: 'k',
        },
      },
    })

    console.log(res)
  }
}
