import { CaptchaDriverContract } from './types.js'

export class CaptchaManager<T extends Record<string, CaptchaDriverContract>> {
  #drivers: T
  #defaultDriver: keyof T

  constructor(params: { drivers: T; defaultDriver: keyof T }) {
    this.#drivers = params.drivers
    this.#defaultDriver = params.defaultDriver
  }

  use(driverName?: keyof T) {
    return this.#drivers[driverName || this.#defaultDriver]
  }
}
