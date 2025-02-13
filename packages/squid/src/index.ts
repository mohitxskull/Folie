import Sqids from 'sqids'
import { shuffleString } from './shuffle_string.js'
import vine from '@vinejs/vine'
import { createHash } from 'node:crypto'
import { Secret } from '@adonisjs/core/helpers'

const defaultDictionary = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export class Squid {
  private minLength: number
  private client: Sqids

  finalMinLength: number
  prefixConnector: string
  prefixBase: string
  dictionary: string

  get prefix() {
    return `${this.prefixBase}${this.prefixConnector}`
  }

  /**
   * Initializes a new instance of the Squid class.
   *
   * @param secret - A secret key used for initializing and seeding the hashing process.
   * @param params - Configuration parameters for the Squid instance.
   * @param params.prefix - The base prefix for generated IDs.
   * @param params.minLength - Optional minimum length for generated IDs, default is 22.
   * @param params.prefixConnector - Optional connector string between prefix parts, default is '_'.
   * @param params.dictionary - Optional custom dictionary for encoding, default is alphanumeric.
   */
  constructor(
    secret: Secret<string>,
    params: {
      prefix: string
      minLength?: number
      prefixConnector?: string
      dictionary?: string
    }
  ) {
    this.prefixBase = params.prefix
    this.prefixConnector = params.prefixConnector ?? '_'

    this.minLength = params.minLength ?? 22

    this.dictionary = params.dictionary ?? defaultDictionary

    this.finalMinLength = this.prefix.length + this.minLength

    const seed = createHash('sha256')
      .update(this.prefix + secret.release)
      .digest('hex')

    const dictionary = shuffleString(this.dictionary, seed)

    this.client = new Sqids({
      alphabet: dictionary,
      minLength: this.minLength,
    })
  }

  /**
   * Encodes a given numerical ID into a UUID string.
   *
   * @param id - Numerical ID to be encoded.
   * @returns Encoded UUID string.
   */
  encode(id: number): string {
    return `${this.prefix}${this.client.encode([id])}`
  }

  /**
   * Decodes a given UUID string into its original numerical ID.
   *
   * @param uuid - UUID string to be decoded.
   * @returns Original numerical ID.
   *
   * @throws {Error} If the UUID length is less than configured minLength.
   * @throws {Error} If the UUID does not start with the configured prefix.
   * @throws {Error} If the UUID is invalid or cannot be decoded.
   */
  decode(uuid: string): number {
    if (typeof uuid !== 'string') {
      throw new Error('Invalid UUID', {
        cause: {
          uuid,
          minLength: this.finalMinLength,
          prefix: this.prefix,
        },
      })
    }

    if (uuid.length < this.finalMinLength) {
      throw new Error('Invalid UUID Length', {
        cause: {
          uuid,
          minLength: this.finalMinLength,
          length: uuid.length,
        },
      })
    }

    if (!uuid.startsWith(this.prefix)) {
      throw new Error('Invalid UUID Prefix', {
        cause: {
          uuid,
          prefix: this.prefix,
        },
      })
    }

    const id = this.client.decode(uuid.replace(new RegExp(`^${this.prefix}`), ''))[0]

    if (!id) {
      throw new Error('Invalid UUID', {
        cause: {
          uuid,
          minLength: this.finalMinLength,
          length: uuid.length,
          prefix: this.prefix,
          response: {
            id,
          },
        },
      })
    }

    return id
  }

  /**
   * A schema for validating Squid UUIDs.
   */
  get schema() {
    return vine
      .string()
      .minLength(this.finalMinLength)
      .startsWith(this.prefix)
      .transform(this.decode.bind(this))
  }
}
