import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import { createPivotReference, createTableReference } from '@folie/castle/helpers'

const tableRef = createTableReference({
  user: 'users',
  session: 'sessions',
  note: 'notes',
  tag: 'tags',
  noteTags: 'note_tags',
})

const pivotRef = createPivotReference(
  {
    noteTags: {
      pivotTable: (t) => t.noteTags(),
    },
  },
  tableRef
)

export const dbRef = {
  table: tableRef,
  pivot: pivotRef,
}

const dbConfig = defineConfig({
  connection: env.get('DB_TYPE'),
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.tmpPath(`${env.get('NODE_ENV')}_db.sqlite3`),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },

    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: 'production',
        ssl: env.get('DB_SSL') === false ? undefined : {},
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
        disableRollbacksInProduction: true,
      },
    },
  },
})

export default dbConfig
