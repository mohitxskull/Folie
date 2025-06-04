import { dbRef } from '#config/database'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.table.note()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.integer('user_id')
        .unsigned()
        .references(dbRef.table.user('id'))
        .notNullable()
        .onDelete('CASCADE')

      t.string('title').notNullable()

      t.text('body').notNullable()

      t.timestamp('created_at')
      t.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
