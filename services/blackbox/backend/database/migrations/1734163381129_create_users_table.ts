import { table } from '#config/tables'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = table.USER()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.string('firstName', 255).nullable()
      t.string('lastName', 255).nullable()

      t.string('email', 200).notNullable().unique()

      t.text('password').notNullable()

      t.text('key').nullable()

      t.text('setting').notNullable()

      t.timestamp('created_at')
      t.timestamp('updated_at')
      t.timestamp('verified_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
