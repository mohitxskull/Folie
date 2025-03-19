# Castle

*Castle* is a collection of functions and classes designed to streamline development in AdonisJS applications. It aims to reduce boilerplate code and enhance code readability and maintainability by providing type-safe configurations for database table and pivot table names.


## Installation

To integrate *Castle* into your AdonisJS project, execute the following command in your terminal:

```bash
pnpm install @folie/castle
```

### Table Configuration

Castle provides a streamlined way to configure and reference your database tables in a type-safe manner. This ensures that you can avoid common pitfalls such as typos in table names and maintain consistency across your application.

To configure your tables, you need to define them in the `config/castle.ts` file. Here is an example configuration:

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
  },
})
```

In this configuration, each key in the `table` object represents a logical name for a table, and the corresponding value is the actual table name in your database. This mapping allows you to reference your tables using the logical names throughout your application, ensuring type safety and consistency.

For example, to reference the `notes` table in a migration file, you can use the following code:

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

In this example, `castle.table.note()` returns the actual table name `notes`, ensuring that your migration file references the correct table name without hardcoding it.

Similarly, you can use the table configuration in your models to define the table name:

```ts
// app/models/note.ts

export default class Note extends BaseModel {
  static table = castle.table.note()
}
```

By using Castle's table configuration, you can maintain a single source of truth for your table names, reducing the risk of errors and improving the maintainability of your codebase.

After configuring Castle, you can use it throughout your application to access database tables and pivot tables in a type-safe manner.

For example, mentioning table name in migration file and models.

To view the complete code for the Note model, visit [here](https://github.com/mohitxskull/Folie/blob/main/playground/backend/app/models/note.ts).

### Pivot Table Configuration

Castle also simplifies the configuration and usage of pivot tables in your AdonisJS application. Pivot tables are essential for managing many-to-many relationships between models. With Castle, you can define these relationships in a type-safe manner, ensuring consistency and reducing the likelihood of errors.

For example, consider a many-to-many relationship between `Note` and `Tag` models. You can configure the pivot table in your `config/castle.ts` file as shown earlier. Then, you can use this configuration in your models to define the relationship.

```ts
// config/castle.ts

import { CastleModule } from '@folie/castle'

export const castle = new CastleModule({
  config: {
    // Omitted
    pivot: {
      noteTags: {
        pivotTable: (t) => t.noteTags(),
      },
    },
  },
})
```

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
    pivot: {
      noteTags: {
        pivotTable: (t) => t.noteTags(),
      },
    },
  },
})
```

By defining the pivot table configuration in this way, you can easily reference it in your models to establish the many-to-many relationship between `Note` and `Tag`.

```ts
// app/models/note.ts

export default class Note extends BaseModel {
  static table = castle.table.note()

  @manyToMany(() => Tag, castle.pivot.noteTags)
  declare tags: ManyToMany<typeof Tag>
}
```

```ts
// app/models/tag.ts

export default class Tag extends BaseModel {
  static table = castle.table.tag()

  @manyToMany(() => Note, castle.pivot.noteTags)
  declare notes: ManyToMany<typeof Note>
}
```

By leveraging Castle's type-safe configurations, you can ensure that your pivot table relationships are correctly defined and maintained throughout your application.
