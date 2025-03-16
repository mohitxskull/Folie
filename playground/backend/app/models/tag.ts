import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { squid } from '#config/squid'
import cache from '@adonisjs/cache/services/main'
import User from './user.js'
import { castle } from '#config/castle'
import { serializeDT } from '@folie/castle/helpers'
import { ModelCache } from '@folie/castle'
import Note from './note.js'

export default class Tag extends BaseModel {
  static table = castle.table.tag()

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

  static $cache() {
    return new ModelCache(Tag, cache.namespace(this.table), ['metric'])
  }

  $cache() {
    return Tag.$cache().row(this)
  }

  $metric(this: Tag) {
    return this.$cache().get({
      key: 'metric',
      factory: async () => {
        const notes = await this.related('notes').query().count('* as $$total')

        return { notes: notes[0].$$total }
      },
      parser: async (p) => p,
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

  @manyToMany(() => Note, castle.pivot.noteTags)
  declare notes: ManyToMany<typeof Note>

  // Extra ======================================

  declare $$total: number
}
