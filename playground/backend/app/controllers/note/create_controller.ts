import { setting } from '#config/setting'
import { ProcessingException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'

export default class Controller {
  handle = handler(async ({ ctx }) => {
    const user = await ctx.auth.session.getUser()

    const metrics = await user.$metric()

    if (metrics.notes >= setting.notes.perUser) {
      throw new ProcessingException('Maximum notes reached')
    }

    const note = await user.related('notes').create({
      title: 'Untitled',
      body: '',
    })

    return { note: note.$serialize(), message: 'Note created successfully' }
  })
}
