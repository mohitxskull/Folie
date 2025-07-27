import { healthChecks } from '#start/health'
import { handler } from '@folie/castle/helpers'

export default class Controller {
  handle = handler(async () => {
    const report = await healthChecks.run()

    return { report }
  })
}
