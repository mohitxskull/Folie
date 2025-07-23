import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { squid } from '#config/squid'
import { serializeDT } from '@folie/castle/helpers'
import { Secret } from '@adonisjs/core/helpers'
import { SessionManager } from '@folie/castle'
import { dbRef } from '#config/database'

export default class Session extends BaseModel {
  static table = dbRef.table.session()

  static manager = new SessionManager<Session, typeof Session>(Session)

  // ====================================

  static $serialize(row: Session) {
    return {
      id: squid.session.encode(row.id),
      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
      expiresAt: serializeDT(row.expiresAt),

      /**
       * Last used at
       */
      usedAt: serializeDT(row.usedAt),
    }
  }

  $serialize(this: Session) {
    return Session.$serialize(this)
  }

  $toJSON(this: Session) {
    return {
      id: this.id,
      hash: this.hash,
      userId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt,
      usedAt: this.usedAt,
    }
  }

  // ====================================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare hash: string

  @column()
  declare ownerId: number

  @belongsTo(() => User)
  declare owner: BelongsTo<typeof User>

  async getOwner(this: Session) {
    await this.load('owner')

    return this.owner
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare usedAt: DateTime | null

  declare value: Secret<string> | null
  declare secret: Secret<string> | null
}
