import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import Session from './session.js'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { squid } from '#config/squid'
import cache from '@adonisjs/cache/services/main'
import Note from './note.js'
import { castle } from '#config/castle'
import { serializeDT } from '@folie/castle/helpers'
import { ModelCache } from '@folie/castle'

export default class User extends BaseModel {
  static table = castle.table.user()

  // Serialize =============================

  static $serialize(row: User) {
    return {
      id: squid.user.encode(row.id),

      firstName: row.firstName,
      lastName: row.lastName,

      email: row.email,

      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
      verifiedAt: serializeDT(row.verifiedAt),
    }
  }

  $serialize() {
    return User.$serialize(this)
  }

  $toJSON() {
    return {
      id: this.id,

      firstName: this.firstName,
      lastName: this.lastName,

      email: this.email,
      password: this.password,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      verifiedAt: this.verifiedAt,
    }
  }

  // Cache =============================

  static $cache() {
    return new ModelCache(User, cache.namespace, ['metric'])
  }

  $cache() {
    return User.$cache().row(this)
  }

  $metric(this: User) {
    return this.$cache().get({
      key: 'metric',
      factory: async () => {
        const notes = await this.related('note').query().count('* as $$total')

        return { notes: notes[0].$$total }
      },
      parser: async (p) => p,
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

  @hasOne(() => Note)
  declare note: HasOne<typeof Note>

  // Extra ======================================
}
