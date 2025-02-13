import { Secret } from '@adonisjs/core/helpers'
import { Squid } from './index.js'

export class SquidFactory {
  private secret: Secret<string>

  constructor(secret: Secret<string>) {
    this.secret = secret
  }

  /**
   * Create a new instance of the Squid class.
   *
   * @param params - Parameters for the new Squid instance.
   * @param params.prefix - The base prefix for generated IDs.
   * @param params.minLength - Optional minimum length for generated IDs, default is 22.
   * @param params.prefixConnector - Optional connector string between prefix parts, default is '_'.
   * @param params.dictionary - Optional custom dictionary for encoding, default is alphanumeric.
   * @returns The new Squid instance.
   */
  create(params: {
    prefix: string
    minLength?: number
    prefixConnector?: string
    dictionary?: string
  }) {
    return new Squid(this.secret, params)
  }
}
