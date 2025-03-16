/// <reference path="../reference.ts" />

import { InferController, endpoint } from '@folie/blueprint-lib'

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
export type V1NoteTagUpdateRoute = InferController<
  (typeof import('../../app/controllers/note/tag/update_controller.ts'))['default']
>
export type V1TagListRoute = InferController<
  (typeof import('../../app/controllers/tag/list_controller.ts'))['default']
>
export type V1TagShowRoute = InferController<
  (typeof import('../../app/controllers/tag/show_controller.ts'))['default']
>
export type V1TagCreateRoute = InferController<
  (typeof import('../../app/controllers/tag/create_controller.ts'))['default']
>
export type V1TagUpdateRoute = InferController<
  (typeof import('../../app/controllers/tag/update_controller.ts'))['default']
>
export type V1TagDeleteRoute = InferController<
  (typeof import('../../app/controllers/tag/delete_controller.ts'))['default']
>
export type V1PingRoute = InferController<
  (typeof import('../../app/controllers/ping_controller.ts'))['default']
>

export const endpoints = {
  V1_AUTH_SESSION: endpoint<V1AuthSessionRoute>({
    form: false,
    url: '/api/v1/auth/session',
    method: 'GET',
  }),
  V1_AUTH_SIGN_OUT: endpoint<V1AuthSignOutRoute>({
    form: false,
    url: '/api/v1/auth/sign-out',
    method: 'POST',
  }),
  V1_AUTH_SIGN_IN: endpoint<V1AuthSignInRoute>({
    form: false,
    url: '/api/v1/auth/sign-in',
    method: 'POST',
  }),
  V1_AUTH_SIGN_UP: endpoint<V1AuthSignUpRoute>({
    form: false,
    url: '/api/v1/auth/sign-up',
    method: 'POST',
  }),
  V1_AUTH_VERIFY: endpoint<V1AuthVerifyRoute>({
    form: false,
    url: '/api/v1/auth/verify',
    method: 'POST',
  }),
  V1_AUTH_PASSWORD_UPDATE: endpoint<V1AuthPasswordUpdateRoute>({
    form: false,
    url: '/api/v1/auth/password',
    method: 'PUT',
  }),
  V1_AUTH_PROFILE_UPDATE: endpoint<V1AuthProfileUpdateRoute>({
    form: false,
    url: '/api/v1/auth/profile',
    method: 'PUT',
  }),
  V1_NOTE_LIST: endpoint<V1NoteListRoute>({ form: false, url: '/api/v1/note', method: 'GET' }),
  V1_NOTE_SHOW: endpoint<V1NoteShowRoute>({
    form: false,
    url: '/api/v1/note/{{ noteId }}',
    method: 'GET',
  }),
  V1_NOTE_CREATE: endpoint<V1NoteCreateRoute>({ form: false, url: '/api/v1/note', method: 'POST' }),
  V1_NOTE_UPDATE: endpoint<V1NoteUpdateRoute>({
    form: false,
    url: '/api/v1/note/{{ noteId }}',
    method: 'PUT',
  }),
  V1_NOTE_DELETE: endpoint<V1NoteDeleteRoute>({
    form: false,
    url: '/api/v1/note/{{ noteId }}',
    method: 'DELETE',
  }),
  V1_NOTE_TAG_UPDATE: endpoint<V1NoteTagUpdateRoute>({
    form: false,
    url: '/api/v1/note/tag/{{ noteId }}',
    method: 'PUT',
  }),
  V1_TAG_LIST: endpoint<V1TagListRoute>({ form: false, url: '/api/v1/tag', method: 'GET' }),
  V1_TAG_SHOW: endpoint<V1TagShowRoute>({
    form: false,
    url: '/api/v1/tag/{{ tagId }}',
    method: 'GET',
  }),
  V1_TAG_CREATE: endpoint<V1TagCreateRoute>({ form: false, url: '/api/v1/tag', method: 'POST' }),
  V1_TAG_UPDATE: endpoint<V1TagUpdateRoute>({
    form: false,
    url: '/api/v1/tag/{{ tagId }}',
    method: 'PUT',
  }),
  V1_TAG_DELETE: endpoint<V1TagDeleteRoute>({
    form: false,
    url: '/api/v1/tag/{{ tagId }}',
    method: 'DELETE',
  }),
  V1_PING: endpoint<V1PingRoute>({ form: false, url: '/api/v1/ping', method: 'GET' }),
} as const
