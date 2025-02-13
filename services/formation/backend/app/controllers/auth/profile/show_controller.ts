import { safeRoute } from '@folie/castle'

export default class Controller {
  handle = safeRoute({
    handle: async ({ ctx }) => {
      return ctx.session.user.$serialize()
    },
  })
}
