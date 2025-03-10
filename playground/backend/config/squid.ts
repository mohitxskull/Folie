import env from '#start/env'
import { SquidModule } from '@folie/squid'

const squidModule = new SquidModule(env.get('SQUID_KEY'))

export const squid = squidModule.group({
  user: {
    prefix: 'usr',
  },
  session: {
    prefix: 'ses',
  },
  note: {
    prefix: 'not',
  },
})
