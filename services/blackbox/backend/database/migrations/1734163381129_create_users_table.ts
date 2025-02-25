import { table } from '#config/tables'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = table.USER()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.string('identifier', 255).notNullable().unique()

      t.text('password').notNullable()

      t.text('key').notNullable()

      t.timestamp('created_at')
      t.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
