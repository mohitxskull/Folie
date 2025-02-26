import { routeController } from '@folie/castle'

export default routeController({
  handle: async ({ ctx }) => {
    const { user } = ctx.session

    const metric = await user.$metric()

    return { metric }
  },
})
