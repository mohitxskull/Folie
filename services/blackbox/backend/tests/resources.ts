import { routes } from '../blueprint/api/schema.js'
import env from '#start/env'
import { inspect } from 'node:util'
import { Gate, GateError } from '@folie/gate'
import User from '#models/user'

export class TestResources {
  base = new URL(`http://${env.get('HOST')}:${env.get('PORT')}`)

  routes = { ...routes }

  api = new Gate({
    base: this.base,
    routes: this.routes,
  })

  password = 'master'

  info = (params?: { email?: string; firstName?: string; lastName?: string }) => ({
    email: params?.email ?? `auto-user@gmail.com`,
    password: this.password,
    firstName: params?.firstName ?? 'Auto',
    lastName: params?.lastName ?? 'User',
  })

  getUser = async (params?: { email?: string; firstName?: string; lastName?: string }) => {
    const info = this.info({
      email: params?.email,
      firstName: params?.firstName,
      lastName: params?.lastName,
    })

    let user = await User.findBy('email', info.email)

    if (!user) {
      user = await User.create(info)
    }

    const { token } = await this.api.endpoint('V1_AUTH_SIGN_IN').call({
      email: info.email,
      password: this.password,
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      user: user,
      api: new Gate({
        base: this.base,
        routes: this.routes,
        token: token,
      }),
    }
  }

  catch = async <T>(promise: Promise<T>): Promise<T> => {
    try {
      return await promise
    } catch (error) {
      if (error instanceof GateError) {
        console.log(inspect(error.toJSON(), { showHidden: false, depth: 15, colors: true }))

        throw new Error('Arcessere Error')
      } else {
        throw error
      }
    }
  }
}

export const testResources = new TestResources()

export type TestManagement = Awaited<ReturnType<typeof testResources.getUser>>
