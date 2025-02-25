export const setting = {
  signUp: {
    enabled: true,
    verification: {
      enabled: true,
      expiresIn: '1 hour',
      purpose: 'email_verification',
    },
  },

  signIn: {
    enabled: true,
  },

  passwordRequirement: {
    crackTime: '1 year',
    score: 3,
    length: {
      min: 8,
      max: 32,
    },
  },
}
