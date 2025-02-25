import logger from '@adonisjs/core/services/logger'
import User from '#models/user'

export const boot = async () => {
  logger.info('Initializing app...')

  await User.firstOrCreate(
    {
      email: 'mohitxskull@gmail.com',
    },
    {
      email: 'mohitxskull@gmail.com',
      password: 'master',
      firstName: 'Skull',
      lastName: 'Dot',
      key: null,
      timeout: 5 * 60,
    }
  )

  logger.info('App initialized')
}
