# Captcha

## Preview

The Captcha package provides a way to integrate CAPTCHA verification into your application. It supports multiple CAPTCHA drivers and allows you to easily switch between them. This package is particularly useful for preventing automated bots from performing actions like signing up or logging in.

## Configuration

To configure the Captcha package, you need to create a `CaptchaManager` instance and provide it with the necessary drivers. Here's an example of how to set up the `CaptchaManager` with the `TurnstileDriver`:

::: code-group

```ts [config/captcha.ts]
import env from '#start/env'
import { CaptchaManager } from '@folie/captcha'
import { TurnstileDriver } from '@folie/captcha/drivers'

export const captcha = new CaptchaManager({
  drivers: {
    default: new TurnstileDriver({
      privateKey: env.get('CAPTCHA_PRIVATE_KEY'),
    }),
  },
  defaultDriver: 'default',
})
```

:::

## Usage

To use the Captcha package in your application, you can create a middleware that verifies the CAPTCHA token. Below is an example of how to create and use the `CaptchaMiddleware`:

::: code-group
```ts [app/middleware/captcha_middleware.ts]
import { captcha } from '#config/captcha'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import vine from '@vinejs/vine'
import { ProcessingException } from '@folie/castle/exception'

const schema = vine.compile(
  vine.object({
    headers: vine.object({
      token: vine.string().maxLength(2048).minLength(10),
    }),
  })
)

export default class CaptchaMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (env.get('NODE_ENV') === 'test') {
      return next()
    }

    const payload = await ctx.request.validateUsing(schema)

    const [isValid] = await captcha
      .use()
      .verify({ token: payload.headers.token, ip: ctx.request.ip() })

    if (!isValid) {
      throw new ProcessingException('Invalid captcha', {
        meta: {
          token: payload.headers.token,
          ip: ctx.request.ip(),
        },
      })
    }

    return next()
  }
}
```
:::

You can then use this middleware in your routes. Here's an example of how to use the `CaptchaMiddleware` in a sign-in route:

::: code-group
```ts [start/routes.ts]
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { signInThrottle } from './limiter.js'

router
  .post('sign-in', [() => import('#controllers/auth/sign_in_controller')])
  .use([signInThrottle, middleware.captcha()])
```
:::

## Creating a driver

To create a new CAPTCHA driver, you need to implement the `CaptchaDriverContract` interface. Below is an example of how to create a `TurnstileDriver`:

::: code-group

```ts [captcha_driver_contract.ts]
export interface CaptchaDriverContract {
  verify: (params: { token: string; [key: string]: any }) => Promise<readonly [boolean, unknown]>
}
```

```ts [turnstile_driver.ts]
import vine from '@vinejs/vine'
import { CaptchaDriverContract } from '../types.js'
import ky from 'ky'

const schema = vine.compile(
  vine.object({
    'success': vine.boolean({ strict: true }),
    'error-codes': vine.array(vine.string()),
    'hostname': vine.string().optional(),
    'action': vine.string().optional(),
    'cdata': vine.string().optional(),
    'challenge_ts': vine
      .date({
        formats: ['iso8601'],
      })
      .optional(),
  })
)

export class TurnstileDriver implements CaptchaDriverContract {
  #privateKey: string
  #baseUrl: string = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

  constructor(params: { privateKey: string; baseUrl?: string }) {
    this.#privateKey = params.privateKey
    if (params.baseUrl) {
      this.#baseUrl = params.baseUrl
    }
  }

  async verify(params: { token: string; ip?: string }) {
    const idempotencyKey = crypto.randomUUID()

    try {
      const response = await ky
        .post(this.#baseUrl, {
          json: {
            secret: this.#privateKey,
            response: params.token,
            remoteip: params.ip,
            idempotency_key: idempotencyKey,
          },
        })
        .json()

      const validatedResponse = await schema.validate(response)

      return [validatedResponse.success, validatedResponse] as const
    } catch (error) {
      throw new Error('Captcha verification failed', {
        cause: error,
      })
    }
  }
}
```

:::

By following this structure, you can create additional drivers as needed and integrate them into your application.
