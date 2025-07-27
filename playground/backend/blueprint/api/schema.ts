import type * as Types from './detached_types.js'
import { endpoint } from '@folie/blueprint-lib'

/*
 * This is an auto-generated file. Changes made to this file will be lost.
 * Run `nr ace blueprint:generate` to update it.
 */

export type * from './detached_types.js'

export const endpoints = {
  V1_AUTH_SESSION: endpoint<Types.V1AuthSessionRoute>({
    url: '/api/v1/auth/session',
    method: 'GET',
  }),
  V1_AUTH_SIGN_OUT: endpoint<Types.V1AuthSignOutRoute>({
    url: '/api/v1/auth/sign-out',
    method: 'POST',
  }),
  V1_AUTH_SIGN_IN: endpoint<Types.V1AuthSignInRoute>({
    url: '/api/v1/auth/sign-in',
    method: 'POST',
  }),
  V1_AUTH_SIGN_UP: endpoint<Types.V1AuthSignUpRoute>({
    url: '/api/v1/auth/sign-up',
    method: 'POST',
  }),
  V1_AUTH_VERIFY: endpoint<Types.V1AuthVerifyRoute>({ url: '/api/v1/auth/verify', method: 'POST' }),
  V1_AUTH_PASSWORD_UPDATE: endpoint<Types.V1AuthPasswordUpdateRoute>({
    url: '/api/v1/auth/password',
    method: 'PUT',
  }),
  V1_AUTH_PROFILE_UPDATE: endpoint<Types.V1AuthProfileUpdateRoute>({
    url: '/api/v1/auth/profile',
    method: 'PUT',
  }),
  V1_NOTE_LIST: endpoint<Types.V1NoteListRoute>({ url: '/api/v1/note', method: 'GET' }),
  V1_NOTE_SHOW: endpoint<Types.V1NoteShowRoute>({
    url: '/api/v1/note/{{ noteId }}',
    method: 'GET',
  }),
  V1_NOTE_CREATE: endpoint<Types.V1NoteCreateRoute>({ url: '/api/v1/note', method: 'POST' }),
  V1_NOTE_UPDATE: endpoint<Types.V1NoteUpdateRoute>({
    url: '/api/v1/note/{{ noteId }}',
    method: 'PUT',
  }),
  V1_NOTE_DELETE: endpoint<Types.V1NoteDeleteRoute>({
    url: '/api/v1/note/{{ noteId }}',
    method: 'DELETE',
  }),
  V1_NOTE_TAG_UPDATE: endpoint<Types.V1NoteTagUpdateRoute>({
    url: '/api/v1/note/tag/{{ noteId }}',
    method: 'PUT',
  }),
  V1_TAG_LIST: endpoint<Types.V1TagListRoute>({ url: '/api/v1/tag', method: 'GET' }),
  V1_TAG_SHOW: endpoint<Types.V1TagShowRoute>({ url: '/api/v1/tag/{{ tagId }}', method: 'GET' }),
  V1_TAG_CREATE: endpoint<Types.V1TagCreateRoute>({ url: '/api/v1/tag', method: 'POST' }),
  V1_TAG_UPDATE: endpoint<Types.V1TagUpdateRoute>({
    url: '/api/v1/tag/{{ tagId }}',
    method: 'PUT',
  }),
  V1_TAG_DELETE: endpoint<Types.V1TagDeleteRoute>({
    url: '/api/v1/tag/{{ tagId }}',
    method: 'DELETE',
  }),
  V1_PING: endpoint<Types.V1PingRoute>({ url: '/api/v1/ping', method: 'GET' }),
} as const
