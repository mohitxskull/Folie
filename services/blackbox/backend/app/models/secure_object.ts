import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { StaticModelCache } from '@folie/castle/service/model_cache_service'
import { serializeDT } from '@folie/castle/helpers/serialize'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { table } from '#config/tables'
import { squid } from '#config/squid'
import cache from '@adonisjs/cache/services/main'
import User from './user.js'

export default class SecureObject extends BaseModel {
  static table = table.SECURE_OBJECT()

  // Serialize =============================

  static serialize(row: SecureObject) {
    return {
      id: squid.USER.encode(row.id),

      identifier: row.identifier,
      password: row.password,
      key: row.key,

      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
    }
  }

  $serialize() {
    return SecureObject.serialize(this)
  }

  $toJSON() {
    return {
      id: this.id,

      identifier: this.identifier,
      password: this.password,
      key: this.key,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  // Cache =============================

  static cache() {
    return new StaticModelCache<SecureObject>(
      cache.namespace(this.table),
      (v) => new SecureObject().fill(v),
      (i) => SecureObject.find(i)
    )
  }

  cache() {
    return SecureObject.cache().internal(this)
  }

  // Columns =============================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare value: string

  @column()
  declare userId: number

  // Extra ======================================

  // DateTime =============================

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hooks =============================

  // Relations =============================

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
