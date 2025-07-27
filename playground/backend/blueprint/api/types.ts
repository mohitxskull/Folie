/// <reference path="../reference.ts" />

import { InferController } from '@folie/blueprint-lib'

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

export type V1HealthRoute = InferController<
  (typeof import('../../app/controllers/health_controller.ts'))['default']
>

export type V1PingRoute = InferController<
  (typeof import('../../app/controllers/ping_controller.ts'))['default']
>
