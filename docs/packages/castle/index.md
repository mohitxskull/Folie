# Castle

*Castle* is a collection of functions and classes designed to streamline development in AdonisJS applications. It aims to reduce boilerplate code and enhance code readability and maintainability by providing type-safe configurations for database table and pivot table names.


## Installation

To integrate *Castle* into your AdonisJS project, execute the following command in your terminal:

```bash
pnpm install @folie/castle
```

## Configuration

The primary configuration for Castle revolves around the CastleModule. This module, configured within your config/castle.ts file,
provides robust type safety for referencing your database table names and pivot table configurations. This ensures that you can 
refer to your database schema with confidence throughout your application.

```ts
// config/castle.ts

import { CastleModule } from '@folie/castle'

export const castle = new CastleModule({
  config: {
    table: {
      user: 'users',
      session: 'sessions',
      note: 'notes',
      tag: 'tags',
      noteTags: 'note_tags',
    },
    pivot: { // Optional
      noteTags: {
        pivotTable: (t) => t.noteTags(),
      },
    },
  },
})
```

### Table

After configuring Castle, you can use it throughout your application to access database tables and pivot tables in a type-safe manner.

For example, mentioning table name in migration file and models.

```ts
// database/migrations/xxxxxx_create_notes_table.ts

import { castle } from '#config/castle'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = castle.table.note()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.integer('user_id')
        .unsigned()
        .references(castle.table.user('id'))
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
```

```ts
// app/models/note.ts

// Omitted

export default class Note extends BaseModel {
  static table = castle.table.note()

  // Omitted
}
```

To view the complete code for the Note model, visit [here](https://github.com/mohitxskull/Folie/blob/main/playground/backend/app/models/note.ts).

### Pivot 