import { setting } from '#config/setting'
import { zxcvbn } from '#config/zxcvbn'
import string from '@adonisjs/core/helpers/string'

/**
 * Validates a password against defined security requirements.
 *
 * @param {string} password - The password to be validated.
 * @param {string[]} [userInputs] - Optional array of strings related to the user (e.g., username, email) to be considered in the password strength analysis.
 * @returns {{ result: true } | { result: false; reason: string }} An object indicating the validation result.
 *         If `result` is true, the password is acceptable.
 *         If `result` is false, the password is not acceptable and `reason` provides the validation failure reason.
 */
export const acceptablePassword = (
  password: string,
  userInputs?: string[]
): { result: true } | { result: false; reason: string } => {
  // Check if password length is less than the minimum required length.
  if (password.length < setting.passwordRequirement.length.min) {
    return {
      result: false,
      reason: `Too short (min length ${setting.passwordRequirement.length.min})`,
    }
  } // Check if password length exceeds the maximum allowed length.

  if (password.length > setting.passwordRequirement.length.max) {
    return {
      result: false,
      reason: `Too long (max length ${setting.passwordRequirement.length.max})`,
    }
  } // Analyze password strength using zxcvbn library.

  const result = zxcvbn(password, userInputs) // Check if the password can be cracked too quickly.

  if (
    result.crackTimesSeconds.offlineFastHashing1e10PerSecond <
    string.seconds.parse(setting.passwordRequirement.crackTime)
  ) {
    return {
      result: false,
      reason: `Can be cracked in ${result.crackTimesDisplay.offlineFastHashing1e10PerSecond} (min ${setting.passwordRequirement.crackTime})`,
    }
  } // Check if the password score is below the minimum required score.

  if (result.score <= setting.passwordRequirement.score) {
    return {
      result: false,
      reason: `Too weak (min score ${setting.passwordRequirement.score})`,
    }
  } // If all checks pass, the password is considered acceptable.

  return {
    result: true,
  }
}
