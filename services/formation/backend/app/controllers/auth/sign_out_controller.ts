import Session from '#models/session'
import { safeRoute } from '@folie/castle'

export default class Controller {
  handle = safeRoute({
    handle: async ({ ctx }) => {
      const tokenId = ctx.session.accessToken.id

      await Session.query().where('id', tokenId).delete()

      return {
        message: 'You have successfully logged out!',
      }
    },
  })
}
