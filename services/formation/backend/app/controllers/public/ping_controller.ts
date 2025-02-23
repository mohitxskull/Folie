import { routeController } from '@folie/castle'
import vine from '@vinejs/vine'

export default routeController({
  input: vine.compile(
    vine.object({
      name: vine.string(),
    })
  ),

  handle: async ({ payload }) => {
    return {
      message: 'Hello, World!',
      payload,
    }
  },
})
