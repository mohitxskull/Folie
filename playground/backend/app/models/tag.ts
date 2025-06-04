import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { squid } from '#config/squid'
import cache from '@adonisjs/cache/services/main'
import User from './user.js'
import { serializeDT } from '@folie/castle/helpers'
import Note from './note.js'
import { KeyCache } from '@folie/castle'
import { dbRef } from '#config/database'

export default class Tag extends BaseModel {
  static table = dbRef.table.tag()

  // Serialize =============================

  static $serialize(row: Tag) {
    return {
      id: squid.tag.encode(row.id),

      userId: squid.user.encode(row.userId),
      slug: row.slug,
      name: row.name,
      description: row.description,

      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
    }
  }

  $serialize() {
    return Tag.$serialize(this)
  }

  $toJSON() {
    return {
      id: this.id,

      userId: this.userId,
      slug: this.slug,
      name: this.name,
      description: this.description,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  // Cache =============================

  static get $cache() {
    return cache.namespace(this.table)
  }

  get $cache() {
    return Tag.$cache.namespace(this.id.toString())
  }

  $metric(this: Tag) {
    return new KeyCache(this.$cache, {
      key: 'metric',
      factory: async () => {
        const notes = await this.related('notes').query().count('* as total')

        return { notes: Number(notes[0].$extras.total) }
      },
    })
  }

  // Columns =============================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  // DateTime =============================

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hooks =============================

  // Relations =============================

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Note, dbRef.pivot.noteTags)
  declare notes: ManyToMany<typeof Note>

  // Extra ======================================
}
