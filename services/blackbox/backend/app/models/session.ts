import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { Secret } from '@adonisjs/core/helpers'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ProcessingException from '@folie/castle/exception/processing_exception'
import { AccessTokenHandler } from '@folie/castle/service/access_token_service'
import { table } from '#config/tables'
import { squid } from '#config/squid'
import { serializeDT } from '@folie/castle/helpers/serialize'

export default class Session extends BaseModel {
  static table = table.SESSION()

  static $ = new AccessTokenHandler<Session, User>({
    prefix: 'ses',
    packer: (draft) => {
      const accessToken = new Session()

      accessToken.userId = draft.ownerId
      accessToken.expiresAt = draft.expiresAt
      accessToken.hash = draft.hash
      accessToken.secret = draft.secret

      return accessToken
    },
    getter: async (decoded) => {
      const accessToken = await Session.find(decoded.id)

      if (!accessToken) {
        throw new ProcessingException('Not a valid access token', {
          meta: {
            reason: 'Token was not found',
          },
        })
      }

      accessToken.secret = decoded.secret

      return accessToken
    },
    owner: async (accessToken) => {
      await accessToken.load('user')

      const { user } = accessToken

      if (!user.verifiedAt) {
        throw new ProcessingException('Not a valid access token', {
          meta: {
            reason: 'User is not verified',
          },
        })
      }

      return user
    },
  })

  static serialize(row: Session) {
    return {
      id: squid.USER.encode(row.id),
      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
      expiresAt: serializeDT(row.expiresAt),

      /**
       * Last used at
       */
      lastUsedAt: serializeDT(row.lastUsedAt),
    }
  }

  $serialize() {
    return Session.serialize(this)
  }

  value() {
    return Session.$.value(this.id, this.secret)
  }

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare hash: string

  secret: Secret<string> | null = null

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare lastUsedAt: DateTime | null
}
