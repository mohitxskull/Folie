export type FunctionSecureResponse<T = undefined> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }
