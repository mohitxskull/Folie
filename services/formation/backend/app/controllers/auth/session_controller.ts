import { safeRoute } from '@folie/castle'

export default class Controller {
  handle = safeRoute({
    handle: async ({ ctx: { session: auth } }) => {
      return auth.user.$serialize()
    },
  })
}
