import { handler } from '@folie/castle/helpers'

export default class Controller {
  handle = handler(async ({ ctx }) => {
    return { session: ctx.auth.session.$serialize() }
  })
}
