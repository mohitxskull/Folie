import { routeController } from '@folie/castle'

export default routeController({
  handle: async () => {
    return { message: 'pong' }
  },
})
