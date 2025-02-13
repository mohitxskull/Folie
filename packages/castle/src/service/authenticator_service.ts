import crypto from 'node:crypto'
import { base32Decode, base32Encode } from '../helpers/base32.js'

export type AuthenticatorAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
export type AuthenticatorEncoding = 'hex' | 'ascii'

type Options = {
  digits?: number
  algorithm?: AuthenticatorAlgorithm
  encoding?: AuthenticatorEncoding
  period?: number
  timestamp?: number
}

const DEFAULT_OPTIONS: Required<Options> = {
  digits: 6,
  algorithm: 'SHA-1',
  encoding: 'hex',
  period: 30,
  timestamp: Date.now(),
}

export class Authenticator {
  static crypto = crypto.webcrypto.subtle

  static async generate(
    key: string,
    options: Options = {}
  ): Promise<{ otp: string; expires: number }> {
    const { digits, algorithm, encoding, period, timestamp } = { ...DEFAULT_OPTIONS, ...options }
    const epochSeconds = Math.floor(timestamp / 1000)
    const timeHex = Math.floor(epochSeconds / period)
      .toString(16)
      .padStart(16, '0')
    const keyBuffer = encoding === 'hex' ? this.base32ToBuffer(key) : this.asciiToBuffer(key)

    const hmacKey = await this.crypto.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: { name: algorithm } },
      false,
      ['sign']
    )
    const signature = await this.crypto.sign('HMAC', hmacKey, this.hex2buf(timeHex))
    const signatureHex = this.buf2hex(signature)
    const offset = Number.parseInt(signatureHex.slice(-1), 16) * 2
    const otp = (Number.parseInt(signatureHex.slice(offset, offset + 8), 16) & 0x7fffffff)
      .toString()
      .slice(-digits)
    const expires = Math.ceil((timestamp + 1) / (period * 1000)) * (period * 1000)

    return { otp, expires }
  }

  static secret(length: number = 20): string {
    return base32Encode(crypto.randomBytes(length))
  }

  private static base32ToBuffer(str: string): ArrayBuffer {
    return new Uint8Array(base32Decode(str)).buffer
  }

  private static asciiToBuffer(str: string): ArrayBuffer {
    return new Uint8Array([...str].map((char) => char.charCodeAt(0))).buffer
  }

  private static hex2buf(hex: string): ArrayBuffer {
    return new Uint8Array(hex.match(/../g)!.map((byte) => Number.parseInt(byte, 16))).buffer
  }

  private static buf2hex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }
}

export class AuthenticatorFactory {
  #options?: Options

  constructor(options?: Options) {
    this.#options = options
  }

  generate(key: string, options: Options = {}) {
    return Authenticator.generate(key, { ...this.#options, ...options })
  }
}
