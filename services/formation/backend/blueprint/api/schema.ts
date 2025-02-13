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
export type V1AuthPasswordUpdateRoute = InferController<
  (typeof import('../../app/controllers/auth/password/update_controller.ts'))['default']
>
export type V1AuthProfileShowRoute = InferController<
  (typeof import('../../app/controllers/auth/profile/show_controller.ts'))['default']
>
export type V1AuthProfileUpdateRoute = InferController<
  (typeof import('../../app/controllers/auth/profile/update_controller.ts'))['default']
>
export type V1FormListRoute = InferController<
  (typeof import('../../app/controllers/form/list_controller.ts'))['default']
>
export type V1FormShowRoute = InferController<
  (typeof import('../../app/controllers/form/show_controller.ts'))['default']
>
export type V1FormCreateRoute = InferController<
  (typeof import('../../app/controllers/form/create_controller.ts'))['default']
>
export type V1FormUpdateRoute = InferController<
  (typeof import('../../app/controllers/form/update_controller.ts'))['default']
>
export type V1FormDeleteRoute = InferController<
  (typeof import('../../app/controllers/form/delete_controller.ts'))['default']
>
export type V1FormRestoreRoute = InferController<
  (typeof import('../../app/controllers/form/restore_controller.ts'))['default']
>
export type V1SubmissionListRoute = InferController<
  (typeof import('../../app/controllers/submission/list_controller.ts'))['default']
>
export type V1PublicFormShowRoute = InferController<
  (typeof import('../../app/controllers/public/form/show_controller.ts'))['default']
>
export type V1PublicSubmissionCreateRoute = InferController<
  (typeof import('../../app/controllers/public/submission/create_controller.ts'))['default']
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
    method: 'GET',
  }),
  V1_AUTH_SIGN_IN: route<V1AuthSignInRoute>({
    form: false,
    path: '/api/v1/auth/sign-in',
    method: 'POST',
  }),
  V1_AUTH_PASSWORD_UPDATE: route<V1AuthPasswordUpdateRoute>({
    form: false,
    path: '/api/v1/auth/password',
    method: 'PUT',
  }),
  V1_AUTH_PROFILE_SHOW: route<V1AuthProfileShowRoute>({
    form: false,
    path: '/api/v1/auth/profile',
    method: 'GET',
  }),
  V1_AUTH_PROFILE_UPDATE: route<V1AuthProfileUpdateRoute>({
    form: false,
    path: '/api/v1/auth/profile',
    method: 'PUT',
  }),
  V1_FORM_LIST: route<V1FormListRoute>({ form: false, path: '/api/v1/form', method: 'GET' }),
  V1_FORM_SHOW: route<V1FormShowRoute>({
    form: false,
    path: '/api/v1/form/{{ formId }}',
    method: 'GET',
  }),
  V1_FORM_CREATE: route<V1FormCreateRoute>({ form: false, path: '/api/v1/form', method: 'POST' }),
  V1_FORM_UPDATE: route<V1FormUpdateRoute>({
    form: false,
    path: '/api/v1/form/{{ formId }}',
    method: 'PUT',
  }),
  V1_FORM_DELETE: route<V1FormDeleteRoute>({
    form: false,
    path: '/api/v1/form/{{ formId }}',
    method: 'DELETE',
  }),
  V1_FORM_RESTORE: route<V1FormRestoreRoute>({
    form: false,
    path: '/api/v1/form/restore/{{ formId }}',
    method: 'PUT',
  }),
  V1_SUBMISSION_LIST: route<V1SubmissionListRoute>({
    form: false,
    path: '/api/v1/submission/{{ formId }}',
    method: 'GET',
  }),
  V1_PUBLIC_FORM_SHOW: route<V1PublicFormShowRoute>({
    form: false,
    path: '/api/v1/public/form/{{ formId }}',
    method: 'POST',
  }),
  V1_PUBLIC_SUBMISSION_CREATE: route<V1PublicSubmissionCreateRoute>({
    form: false,
    path: '/api/v1/public/submission/{{ formId }}',
    method: 'POST',
  }),
} as const
