import { table } from '#config/tables'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = table.SECURE_OBJECT()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.text('key').notNullable()

      t.integer('type').nullable()

      t.integer('user_id').unsigned().references(table.USER('id')).notNullable().onDelete('CASCADE')

      t.text('value').notNullable()

      t.integer('version').notNullable().defaultTo(0)

      t.unique(['user_id', 'version'])

      t.timestamp('created_at')
      t.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
