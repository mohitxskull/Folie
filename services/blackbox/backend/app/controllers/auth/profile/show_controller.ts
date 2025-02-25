import { routeController } from '@folie/castle'

export default routeController({
  handle: async ({ ctx }) => {
    return ctx.session.user.$serialize()
  },
})
