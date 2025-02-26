/// <reference path="../reference.ts" />

import { InferController, route } from '@folie/blueprint-lib'

/*
 * This is an auto-generated file. Changes made to this file will be lost.
 * Run `nr ace blueprint:generate` to update it.
 */

export type V1AuthSessionRoute = InferController<
  (typeof import('../../app/controllers/auth/session_controller.ts'))['default']
>
export type V1AuthSignOutRoute = InferController<
  (typeof import('../../app/controllers/auth/sign_out_controller.ts'))['default']
>
export type V1AuthSignInRoute = InferController<
  (typeof import('../../app/controllers/auth/sign_in_controller.ts'))['default']
>
export type V1AuthSignUpRoute = InferController<
  (typeof import('../../app/controllers/auth/sign_up_controller.ts'))['default']
>
export type V1AuthVerifyRoute = InferController<
  (typeof import('../../app/controllers/auth/verify_controller.ts'))['default']
>
export type V1AuthPasswordUpdateRoute = InferController<
  (typeof import('../../app/controllers/auth/password/update_controller.ts'))['default']
>
export type V1AuthProfileUpdateRoute = InferController<
  (typeof import('../../app/controllers/auth/profile/update_controller.ts'))['default']
>
export type V1AuthProfileMetricRoute = InferController<
  (typeof import('../../app/controllers/auth/profile/metric_controller.ts'))['default']
>
export type V1VaultKeyShowRoute = InferController<
  (typeof import('../../app/controllers/vault/key/show_controller.ts'))['default']
>
export type V1VaultKeyUpdateRoute = InferController<
  (typeof import('../../app/controllers/vault/key/update_controller.ts'))['default']
>
export type V1VaultObjectListRoute = InferController<
  (typeof import('../../app/controllers/vault/object/list_controller.ts'))['default']
>
export type V1VaultObjectShowRoute = InferController<
  (typeof import('../../app/controllers/vault/object/show_controller.ts'))['default']
>
export type V1VaultObjectCreateRoute = InferController<
  (typeof import('../../app/controllers/vault/object/create_controller.ts'))['default']
>
export type V1VaultObjectUpdateRoute = InferController<
  (typeof import('../../app/controllers/vault/object/update_controller.ts'))['default']
>
export type V1VaultObjectDeleteRoute = InferController<
  (typeof import('../../app/controllers/vault/object/delete_controller.ts'))['default']
>

export const routes = {
  V1_AUTH_SESSION: route<V1AuthSessionRoute>({
    form: false,
    path: '/api/v1/auth/session',
    method: 'GET',
  }),
  V1_AUTH_SIGN_OUT: route<V1AuthSignOutRoute>({
    form: false,
    path: '/api/v1/auth/sign-out',
    method: 'POST',
  }),
  V1_AUTH_SIGN_IN: route<V1AuthSignInRoute>({
    form: false,
    path: '/api/v1/auth/sign-in',
    method: 'POST',
  }),
  V1_AUTH_SIGN_UP: route<V1AuthSignUpRoute>({
    form: false,
    path: '/api/v1/auth/sign-up',
    method: 'POST',
  }),
  V1_AUTH_VERIFY: route<V1AuthVerifyRoute>({
    form: false,
    path: '/api/v1/auth/verify',
    method: 'POST',
  }),
  V1_AUTH_PASSWORD_UPDATE: route<V1AuthPasswordUpdateRoute>({
    form: false,
    path: '/api/v1/auth/password',
    method: 'PUT',
  }),
  V1_AUTH_PROFILE_UPDATE: route<V1AuthProfileUpdateRoute>({
    form: false,
    path: '/api/v1/auth/profile',
    method: 'PUT',
  }),
  V1_AUTH_PROFILE_METRIC: route<V1AuthProfileMetricRoute>({
    form: false,
    path: '/api/v1/auth/profile/metric',
    method: 'GET',
  }),
  V1_VAULT_KEY_SHOW: route<V1VaultKeyShowRoute>({
    form: false,
    path: '/api/v1/vault/key',
    method: 'GET',
  }),
  V1_VAULT_KEY_UPDATE: route<V1VaultKeyUpdateRoute>({
    form: false,
    path: '/api/v1/vault/key',
    method: 'PUT',
  }),
  V1_VAULT_OBJECT_LIST: route<V1VaultObjectListRoute>({
    form: false,
    path: '/api/v1/vault/object',
    method: 'GET',
  }),
  V1_VAULT_OBJECT_SHOW: route<V1VaultObjectShowRoute>({
    form: false,
    path: '/api/v1/vault/object/{{ secretObjectId }}',
    method: 'GET',
  }),
  V1_VAULT_OBJECT_CREATE: route<V1VaultObjectCreateRoute>({
    form: false,
    path: '/api/v1/vault/object',
    method: 'POST',
  }),
  V1_VAULT_OBJECT_UPDATE: route<V1VaultObjectUpdateRoute>({
    form: false,
    path: '/api/v1/vault/object/{{ secretObjectId }}',
    method: 'PUT',
  }),
  V1_VAULT_OBJECT_DELETE: route<V1VaultObjectDeleteRoute>({
    form: false,
    path: '/api/v1/vault/object/{{ secretObjectId }}',
    method: 'DELETE',
  }),
} as const
