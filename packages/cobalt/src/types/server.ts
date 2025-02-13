export type CheckpointParams =
  | {
      allow: true
    }
  | {
      allow: false
      redirect: string
    }
