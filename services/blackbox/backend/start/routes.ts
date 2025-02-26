/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { signInThrottle, signUpThrottle, throttle } from './limiter.js'

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            router
              .get('session', [() => import('#controllers/auth/session_controller')])
              .use(middleware.auth())

            router
              .post('sign-out', [() => import('#controllers/auth/sign_out_controller')])
              .use(middleware.auth())

            router
              .post('sign-in', [() => import('#controllers/auth/sign_in_controller')])
              .use([signInThrottle, middleware.captcha()])

            router
              .post('sign-up', [() => import('#controllers/auth/sign_up_controller')])
              .use([signUpThrottle, middleware.captcha()])

            router
              .post('verify', [() => import('#controllers/auth/verify_controller')])
              .use([middleware.captcha()])

            router
              .group(() => {
                router.put('', [() => import('#controllers/auth/password/update_controller')])
              })
              .prefix('password')
              .use(middleware.auth())

            router
              .group(() => {
                router.put('', [() => import('#controllers/auth/profile/update_controller')])

                router.get('metric', [() => import('#controllers/auth/profile/metric_controller')])
              })
              .prefix('profile')
              .use(middleware.auth())
          })
          .prefix('auth')

        router
          .group(() => {
            router
              .group(() => {
                router.get('', [() => import('#controllers/vault/key/show_controller')])
                router.put('', [() => import('#controllers/vault/key/update_controller')])
              })
              .prefix('key')

            router
              .group(() => {
                router.get('', [() => import('#controllers/vault/object/list_controller')])

                router.get(':secretObjectId', [
                  () => import('#controllers/vault/object/show_controller'),
                ])

                router.post('', [() => import('#controllers/vault/object/create_controller')])

                router.put(':secretObjectId', [
                  () => import('#controllers/vault/object/update_controller'),
                ])

                router.delete(':secretObjectId', [
                  () => import('#controllers/vault/object/delete_controller'),
                ])
              })
              .prefix('object')
          })
          .prefix('vault')
          .use(middleware.auth())

        router.get('ping', [() => import('#controllers/ping_controller')])
      })
      .prefix('v1')
  })
  .prefix('api')
  .use(throttle)

router
  .any('*', (ctx) => {
    throw new ProcessingException('Route not found', {
      status: 404,
      code: 'E_ROUTE_NOT_FOUND',
      meta: {
        public: {
          route: ctx.request.url(),
          method: ctx.request.method(),
        },
      },
    })
  })
  .use(throttle)
