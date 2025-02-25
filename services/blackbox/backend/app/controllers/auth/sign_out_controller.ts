import Session from '#models/session'
import { routeController } from '@folie/castle'

export default routeController({
  handle: async ({ ctx }) => {
    const tokenId = ctx.session.accessToken.id

    await Session.query().where('id', tokenId).delete()

    return {
      message: 'You have successfully logged out!',
    }
  },
})
