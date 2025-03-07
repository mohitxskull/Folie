import { base64, safeEqual, Secret } from '@adonisjs/core/helpers'
import stringHelpers from '@adonisjs/core/helpers/string'
import { LucidModel, LucidRow } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { CRC32 } from '../src/helpers/crc32.js'
import { createHash } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ProcessingException } from '../src/exceptions/processing_exception.js'
import { getBearerToken } from '../src/helpers/get_bearer_token.js'
import { HttpContext } from '@adonisjs/core/http'

interface UserRow extends LucidRow {
  id: number
  createdAt: DateTime
  updatedAt: DateTime
}

interface UserModel extends LucidModel {
  new (): UserRow
}

interface SessionRow extends LucidRow {
  id: number
  hash: string
  userId: number
  value: Secret<string> | null
  secret: Secret<string> | null
  createdAt: DateTime
  updatedAt: DateTime
  expiresAt: DateTime | null
  usedAt: DateTime | null
}

interface SessionModel extends LucidModel {
  new (): SessionRow
}

export class SessionManager<SessionModelG extends SessionModel, UserModelG extends UserModel> {
  #tokenPrefix = 'oat_'

  /**
   * The size of the hash in bytes.
   */
  #secretSize = 64

  /**
   * The maximum number of sessions per user.
   */
  #maxSessions = 3

  #invalidMessage = 'Not a valid session'

  /**
   * Creates a secret opaque token and its hash. The secret is
   * suffixed with a crc32 checksum for secret scanning tools
   * to easily identify the token.
   */
  #seed() {
    const seed = stringHelpers.random(this.#secretSize)
    const secret = new Secret(`${seed}${new CRC32().calculate(seed)}`)
    const hash = createHash('sha256').update(secret.release()).digest('hex')
    return { secret, hash }
  }

  /**
   * Decodes a publicly shared token and return the series
   * and the token value from it.
   *
   * Returns null when unable to decode the token because of
   * invalid format or encoding.
   */
  async #decode(value: string) {
    /**
     * Ensure value is a string and starts with the prefix.
     */
    if (typeof value !== 'string' || !value.startsWith(`${this.#tokenPrefix}`)) {
      return null
    }

    /**
     * Remove prefix from the rest of the token.
     */
    const token = value.replace(new RegExp(`^${this.#tokenPrefix}`), '')

    if (!token) {
      return null
    }

    const [identifier, ...tokenValue] = token.split('.')

    if (!identifier || tokenValue.length === 0) {
      return null
    }

    const decodedIdentifier = base64.urlDecode(identifier)

    const decodedSecret = base64.urlDecode(tokenValue.join('.'))

    if (!decodedIdentifier || !decodedSecret) {
      return null
    }

    const session = (await this.sessionModel.find(Number(decodedIdentifier))) as SessionRow | null

    if (!session) {
      throw new ProcessingException(this.#invalidMessage, {
        meta: {
          reason: 'Session not found',
        },
      })
    }

    session.secret = new Secret(decodedSecret)
    session.value = this.#value(session.id, decodedSecret)

    return session
  }

  #isVerified(hash: string, secret: Secret<string>): boolean {
    const newHash = createHash('sha256').update(secret.release()).digest('hex')

    return safeEqual(hash, newHash)
  }

  #isExpired(expiresAt: DateTime<boolean>) {
    return expiresAt < DateTime.utc()
  }

  #value(sessionId: number, secret: string) {
    return new Secret(
      `${this.#tokenPrefix}${base64.urlEncode(String(sessionId))}.${base64.urlEncode(secret)}`
    )
  }

  constructor(
    private readonly sessionModel: SessionModelG,
    private readonly userModel: UserModelG,
    options?: {
      maxSessions?: number
      tokenPrefix?: string
      secretSize?: number
      invalidMessage?: string
    }
  ) {
    this.#maxSessions = options?.maxSessions || this.#maxSessions
    this.#tokenPrefix = options?.tokenPrefix || this.#tokenPrefix
    this.#secretSize = options?.secretSize || this.#secretSize
    this.#invalidMessage = options?.invalidMessage || this.#invalidMessage
  }

  async create(
    user: LucidRow & {
      id: number
    },
    options?: { expiresIn?: string | number; client?: TransactionClientContract }
  ) {
    const trx = options?.client || (await db.transaction())

    try {
      // Deleting last session if max reached
      const activeSessions = await this.sessionModel
        .query({ client: trx })
        .where('user_id', user.id)
        .orderBy('created_at', 'desc')
        .limit(this.#maxSessions + 1)

      if (activeSessions.length > this.#maxSessions) {
        await activeSessions.pop()?.delete()
      }

      const newSession = new this.sessionModel()

      if (options?.expiresIn) {
        newSession.expiresAt = DateTime.utc().plus({
          seconds: stringHelpers.seconds.parse(options.expiresIn),
        })
      }

      const seed = this.#seed()

      newSession.hash = seed.hash
      newSession.userId = user.id
      newSession.secret = seed.secret

      await newSession.save()

      if (!newSession.$isPersisted || !newSession.id) {
        throw new Error('Failed to create session', {
          cause: {
            reason: 'Failed to persist session or session id is missing',
            session: newSession.toJSON(),
          },
        })
      }

      newSession.value = this.#value(newSession.id, seed.secret.release())

      return newSession
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async authenticate(ctx: HttpContext) {
    const token = getBearerToken(ctx)

    if (!token) {
      throw new ProcessingException(this.#invalidMessage, {
        meta: {
          reason: 'Token not found in request',
          token: typeof token,
        },
      })
    }

    const session = await this.#decode(token)

    if (!session) {
      throw new ProcessingException(this.#invalidMessage, {
        meta: {
          reason: 'Session not found',
        },
      })
    }

    if (session.secret) {
      if (!this.#isVerified(session.hash, session.secret)) {
        throw new ProcessingException(this.#invalidMessage, {
          meta: {
            reason: 'Invalid secret',
          },
        })
      }
    } else {
      throw new Error('Secret not found in decoded session')
    }

    if (session.expiresAt) {
      if (this.#isExpired(session.expiresAt)) {
        throw new ProcessingException(this.#invalidMessage, {
          meta: {
            reason: 'Expired session',
          },
        })
      }
    }

    const user = await this.userModel.find(session.userId)

    if (!user) {
      throw new ProcessingException(this.#invalidMessage, {
        meta: {
          reason: 'User not found',
        },
      })
    }

    return [user, session] as const
  }
}
