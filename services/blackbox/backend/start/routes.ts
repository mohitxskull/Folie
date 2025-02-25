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
              .get('sign-out', [() => import('#controllers/auth/sign_out_controller')])
              .use(middleware.auth())

            router
              .post('sign-in', [() => import('#controllers/auth/sign_in_controller')])
              .use([signInThrottle, middleware.captcha()])

            router
              .post('sign-up', [() => import('#controllers/auth/sign_up_controller')])
              .use([signUpThrottle, middleware.captcha()])

            router
              .group(() => {
                router.put('', [() => import('#controllers/auth/password/update_controller')])
              })
              .prefix('password')
              .use(middleware.auth())

            router
              .group(() => {
                router.put('', [() => import('#controllers/auth/profile/update_controller')])
              })
              .prefix('profile')
              .use(middleware.auth())
          })
          .prefix('auth')

        router
          .group(() => {
            router.get('', [() => import('#controllers/form/list_controller')])
            router.get(':formId', [() => import('#controllers/form/show_controller')])
            router.post('', [() => import('#controllers/form/create_controller')])
            router.put(':formId', [() => import('#controllers/form/update_controller')])
            router.delete(':formId', [() => import('#controllers/form/delete_controller')])
            router.put('restore/:formId', [() => import('#controllers/form/restore_controller')])
          })
          .prefix('form')
          .use(middleware.auth())
      })
      .prefix('v1')
  })
  .prefix('api')
  .use(throttle)

router
  .any('*', () => {
    throw new ProcessingException('Route not found', {
      status: 404,
      code: 'E_ROUTE_NOT_FOUND',
    })
  })
  .use(throttle)
