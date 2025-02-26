import { XEnum } from '@folie/lib'

/**
 * DON'T EVER CHANGE THIS NUMBERS ELSE YOU WILL BREAK THE DATABASE
 */

export const SecureObjectType = new XEnum({
  TAG: 0,
})

export type SecureObjectTypeKeys = (typeof SecureObjectType)['keys'][number]
