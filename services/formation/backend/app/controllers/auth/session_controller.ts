import { routeController } from '@folie/castle'

export default routeController({
  handle: async ({ ctx: { session: auth } }) => {
    return auth.user.$serialize()
  },
})
