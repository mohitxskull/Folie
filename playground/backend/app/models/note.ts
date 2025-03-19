import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { squid } from '#config/squid'
import cache from '@adonisjs/cache/services/main'
import User from './user.js'
import { castle } from '#config/castle'
import { serializeDT } from '@folie/castle/helpers'
import { ModelCache } from '@folie/castle'
import Tag from './tag.js'

export default class Note extends BaseModel {
  static table = castle.table.note()

  // Serialize =============================

  static $serialize(row: Note) {
    return {
      id: squid.note.encode(row.id),

      userId: squid.user.encode(row.userId),
      title: row.title,
      body: row.body,

      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
    }
  }

  $serialize() {
    return Note.$serialize(this)
  }

  $toJSON() {
    return {
      id: this.id,

      userId: this.userId,
      title: this.title,
      body: this.body,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  // Cache =============================

  static $cache() {
    return new ModelCache(Note, cache.namespace(this.table))
  }

  $cache() {
    return Note.$cache().row(this)
  }

  // Columns =============================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare body: string

  // DateTime =============================

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hooks =============================

  // Relations =============================

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Tag, castle.pivot.noteTags)
  declare tags: ManyToMany<typeof Tag>

  // Extra ======================================
}
