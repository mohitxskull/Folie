import env from '#start/env'
import { SettingService } from '@folie/castle/service/setting_service'

const NODE_ENV = env.get('NODE_ENV')
type NodeEnv = typeof NODE_ENV

const s = <T extends boolean | number | string>(
  initial: T,
  envs?: {
    [NODE_ENV in NodeEnv]?: T
  }
) => {
  return envs ? envs[NODE_ENV] || initial : initial
}

export const setting = new SettingService({
  SIGNIN_ENABLED: s(true, { test: true }),

  MAIL_FROM: 'Acme <onboarding@resend.dev>',
})
