import { dbRef } from '#config/database'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.table.session()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.string('hash').notNullable()

      t.integer('user_id')
        .unsigned()
        .references(dbRef.table.user('id'))
        .notNullable()
        .onDelete('CASCADE')

      t.timestamp('created_at')
      t.timestamp('updated_at')
      t.timestamp('expires_at').nullable()
      t.timestamp('used_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
