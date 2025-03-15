import { castle } from '#config/castle'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = castle.table.tag()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.integer('user_id')
        .unsigned()
        .references(castle.table.user('id'))
        .notNullable()
        .onDelete('CASCADE')

      t.string('slug').notNullable()

      t.string('name').notNullable()

      t.string('description').nullable()

      t.unique(['user_id', 'slug'])

      t.timestamp('created_at')
      t.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
