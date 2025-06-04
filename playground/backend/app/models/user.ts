import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import Session from './session.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { squid } from '#config/squid'
import cache from '@adonisjs/cache/services/main'
import Note from './note.js'
import { serializeDT } from '@folie/castle/helpers'
import Tag from './tag.js'
import { KeyCache } from '@folie/castle'
import { dbRef } from '#config/database'

export default class User extends BaseModel {
  static table = dbRef.table.user()

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

  static get $cache() {
    return cache.namespace(this.table)
  }

  get $cache() {
    return User.$cache.namespace(this.id.toString())
  }

  $metric(this: User) {
    return new KeyCache(this.$cache, {
      key: 'metric',
      factory: async () => {
        const [notes, tags] = await Promise.all([
          this.related('notes').query().count('* as total'),
          this.related('tags').query().count('* as total'),
        ])

        return { notes: Number(notes[0].$extras.total), tags: Number(tags[0].$extras.total) }
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

  @hasMany(() => Note)
  declare notes: HasMany<typeof Note>

  @hasMany(() => Tag)
  declare tags: HasMany<typeof Tag>

  // Extra ======================================
}
