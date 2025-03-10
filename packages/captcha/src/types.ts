export interface CaptchaDriverContract {
  verify: (params: { token: string; [key: string]: any }) => Promise<readonly [boolean, unknown]>
}
