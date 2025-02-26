import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import { StaticModelCache } from '@folie/castle/service/model_cache_service'
import { serializeDT } from '@folie/castle/helpers/serialize'
import hash from '@adonisjs/core/services/hash'
import Session from './session.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { table } from '#config/tables'
import { squid } from '#config/squid'
import cache from '@adonisjs/cache/services/main'
import SecureObject from './secure_object.js'
import { JSONColumn } from '@folie/castle/column/json'
import { SecureObjectType } from '#types/enum'

export default class User extends BaseModel {
  static table = table.USER()

  // Serialize =============================

  static serialize(row: User) {
    return {
      id: squid.USER.encode(row.id),

      firstName: row.firstName,
      lastName: row.lastName,

      email: row.email,
      setting: row.setting,

      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
      verifiedAt: serializeDT(row.verifiedAt),
    }
  }

  $serialize() {
    return User.serialize(this)
  }

  $toJSON() {
    return {
      id: this.id,

      firstName: this.firstName,
      lastName: this.lastName,

      email: this.email,
      password: this.password,
      key: this.key,
      setting: this.setting,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      verifiedAt: this.verifiedAt,
    }
  }

  // Cache =============================

  static cache() {
    return new StaticModelCache<User, 'metric'>(
      cache.namespace(this.table),
      (v) => new User().fill(v),
      (i) => User.find(i)
    )
  }

  cache() {
    return User.cache().internal(this)
  }

  $metric(this: User, options?: { latest?: boolean }) {
    return this.cache().get({
      key: 'metric',
      factory: async () => {
        const [simpleObjectCount, tagObjectCount] = await Promise.all([
          await this.related('secureObjects').query().whereNull('type').count('* as total').first(),
          await this.related('secureObjects')
            .query()
            .where('type', SecureObjectType.keyof('TAG'))
            .count('* as $$total')
            .first(),
        ])

        if (!simpleObjectCount || !tagObjectCount) {
          throw new Error('Failed to fetch metric data')
        }

        return {
          simpleObjectCount: simpleObjectCount.$$total,
          tagObjectCount: tagObjectCount.$$total,
        }
      },
      parser: async (o) => o,
      latest: options?.latest,
      options: {
        ttl: '1 hour',
      },
    })
  }

  // Columns =============================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare key: string | null

  @column(JSONColumn())
  declare setting: { timeout: number | null }

  // DateTime =============================

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare verifiedAt: DateTime | null

  // Hooks =============================

  @beforeSave()
  static async hashPassword(row: User) {
    if (row.$dirty.password) {
      row.password = await hash.make(row.password)
    }
  }

  // Relations =============================

  @hasMany(() => Session)
  declare sessions: HasMany<typeof Session>

  @hasMany(() => SecureObject)
  declare secureObjects: HasMany<typeof SecureObject>

  // Extra ======================================
}
