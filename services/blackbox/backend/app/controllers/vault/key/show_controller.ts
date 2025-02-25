import { routeController } from '@folie/castle'

export default routeController({
  handle: async ({ ctx }) => {
    return { key: ctx.session.user.key }
  },
})
