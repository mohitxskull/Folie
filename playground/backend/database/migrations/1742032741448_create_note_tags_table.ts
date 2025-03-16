import { castle } from '#config/castle'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = castle.table.noteTags()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.integer('note_id')
        .unsigned()
        .references(castle.table.note('id'))
        .notNullable()
        .onDelete('CASCADE')

      t.integer('tag_id')
        .unsigned()
        .references(castle.table.tag('id'))
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
