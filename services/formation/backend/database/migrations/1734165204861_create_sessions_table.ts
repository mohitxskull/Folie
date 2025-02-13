import { table } from '#config/tables'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = table.SESSION()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.string('hash').notNullable()

      t.integer('user_id').unsigned().references(table.USER('id')).notNullable().onDelete('CASCADE')

      t.timestamp('created_at')
      t.timestamp('updated_at')
      t.timestamp('expires_at').nullable()
      t.timestamp('last_used_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
