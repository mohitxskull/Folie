import string from '@adonisjs/core/helpers/string'

export const setting = {
  signUp: {
    enabled: true,
    verification: {
      enabled: true,
      expiresIn: string.milliseconds.parse('1 hour')!,
      purpose: 'email_verification',
    },
  },

  signIn: {
    enabled: true,
  },

  passwordRequirement: {
    crackTime: string.seconds.parse('1 year')!,
    score: 3,
    size: {
      min: 8,
      max: 32,
    },
  },

  secureObject: {
    simple: {
      maxCount: 500,
      maxSize: string.bytes.parse('2KB')!,
    },

    tag: {
      maxCount: 50,
      maxSize: string.bytes.parse('1KB')!,
    },
  },

  secureKey: {
    minSize: 16,
    maxSize: 500,
  },
}
