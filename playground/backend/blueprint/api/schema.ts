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
export type V1NoteListRoute = InferController<
  (typeof import('../../app/controllers/note/list_controller.ts'))['default']
>
export type V1NoteShowRoute = InferController<
  (typeof import('../../app/controllers/note/show_controller.ts'))['default']
>
export type V1NoteCreateRoute = InferController<
  (typeof import('../../app/controllers/note/create_controller.ts'))['default']
>
export type V1NoteUpdateRoute = InferController<
  (typeof import('../../app/controllers/note/update_controller.ts'))['default']
>
export type V1NoteDeleteRoute = InferController<
  (typeof import('../../app/controllers/note/delete_controller.ts'))['default']
>
export type V1PingRoute = InferController<
  (typeof import('../../app/controllers/ping_controller.ts'))['default']
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
  V1_NOTE_LIST: route<V1NoteListRoute>({ form: false, path: '/api/v1/note', method: 'GET' }),
  V1_NOTE_SHOW: route<V1NoteShowRoute>({
    form: false,
    path: '/api/v1/note/{{ noteId }}',
    method: 'GET',
  }),
  V1_NOTE_CREATE: route<V1NoteCreateRoute>({ form: false, path: '/api/v1/note', method: 'POST' }),
  V1_NOTE_UPDATE: route<V1NoteUpdateRoute>({
    form: false,
    path: '/api/v1/note/{{ noteId }}',
    method: 'PUT',
  }),
  V1_NOTE_DELETE: route<V1NoteDeleteRoute>({
    form: false,
    path: '/api/v1/note/{{ noteId }}',
    method: 'DELETE',
  }),
  V1_PING: route<V1PingRoute>({ form: false, path: '/api/v1/ping', method: 'GET' }),
} as const
