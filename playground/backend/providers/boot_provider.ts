import type { ApplicationService } from '@adonisjs/core/types'
import { boot } from '../app/boot.js'
import ace from '@adonisjs/core/services/ace'
import logger from '@adonisjs/core/services/logger'

export default class BootProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {
    if (['web'].includes(this.app.getEnvironment())) {
      await ace.boot()

      if (ace.hasCommand('migration:run')) {
        try {
          await ace.exec('migration:run', ['--force'])
        } catch (error) {
          logger.error({ err: error })

          await this.app.terminate()
        }
      } else {
        logger.error('Migration command not found')
      }
    }
  }

  /**
   * The process has been started
   */
  async ready() {
    if (['web'].includes(this.app.getEnvironment())) {
      await boot()
    }
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
