import env from '#start/env'
import { Secret } from '@adonisjs/core/helpers'
import { SquidFactory } from '@folie/squid'

const squidFactory = new SquidFactory(new Secret(env.get('SQUID_KEY')))

export const squid = {
  USER: squidFactory.create({
    prefix: 'usr',
  }),

  SESSION: squidFactory.create({
    prefix: 'ses',
  }),

  SECURE_OBJECT: squidFactory.create({
    prefix: 'obj',
  }),
}
