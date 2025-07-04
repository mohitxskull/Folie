import { dbRef } from '#config/database'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.table.noteTags()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.integer('note_id')
        .unsigned()
        .references(dbRef.table.note('id'))
        .notNullable()
        .onDelete('CASCADE')

      t.integer('tag_id')
        .unsigned()
        .references(dbRef.table.tag('id'))
        .notNullable()
        .onDelete('CASCADE')

      t.unique(['note_id', 'tag_id'])

      t.timestamp('created_at')
      t.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
