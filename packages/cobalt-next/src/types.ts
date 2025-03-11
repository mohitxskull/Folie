import { Redirect } from 'next'

export type NextServerErrorResponse = { type: '404' } | { type: 'redirect'; redirect: Redirect }

export type CheckpointParams =
  | {
      allow: true
    }
  | {
      allow: false
      redirect: string
    }
