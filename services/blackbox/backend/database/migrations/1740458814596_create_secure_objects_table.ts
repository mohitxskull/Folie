import { table } from '#config/tables'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = table.SECURE_OBJECT()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.text('key').notNullable()

      t.integer('user_id').unsigned().references(table.USER('id')).notNullable().onDelete('CASCADE')

      t.text('value').notNullable()

      t.timestamp('created_at')
      t.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
