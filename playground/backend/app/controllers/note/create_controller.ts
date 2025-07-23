import { setting } from '#config/setting'
import { ForbiddenException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'

export default class Controller {
  handle = handler(async ({ ctx }) => {
    const user = await ctx.auth.session.getOwner()

    const metrics = await user.$metric().get()

    if (metrics.notes >= setting.notes.perUser) {
      throw new ForbiddenException('Maximum notes reached')
    }

    const note = await user.related('notes').create({
      title: 'Untitled',
      body: '',
    })

    return { note: note.$serialize(), message: 'Note created successfully' }
  })
}
