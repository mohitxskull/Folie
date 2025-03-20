# Session Manager Module

The Session Manager module in the `castle` package provides a robust mechanism for managing user sessions in an AdonisJS application. This module helps in creating, authenticating, and managing user sessions securely. Below is a detailed guide on how to use the Session Manager module.

> Refer to the playground for detailed usage examples and implementation.

## Setting Up Session Manager

To set up the Session Manager for a Lucid model, you need to create a `SessionManager` instance and define the necessary configurations.

### Example: Setting Up Session Model

```ts
// /app/models/session.ts

import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import { SessionManager } from '@folie/castle'

export default class Session extends BaseModel {
  static table = 'sessions'

  static manager = new SessionManager(Session)

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare hash: string

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare usedAt: DateTime | null

  declare value: Secret<string> | null
  declare secret: Secret<string> | null
}
```

## Usage

### Creating a Session

To create a session for a user, use the `create` method of the `SessionManager` instance. This method generates a new session token and stores it in the database.

```ts
import User from '#models/user'
import Session from '#models/session'

const user = await User.find(1)

if (user) {
  const session = await Session.manager.create(user, { expiresIn: '1h' })
  console.log(session.value) // Session token
}
```

### Authenticating a Session

To authenticate a session, use the `authenticate` method of the `SessionManager` instance. This method verifies the session token and returns the session if valid.

```ts
import Session from '#models/session'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options?: { bypass?: true }) {
    try {
      const session = await Session.manager.authenticate(ctx)
      ctx.auth = { session }
      await next()
    } catch (error) {
      if (options?.bypass === true) {
        await next()
      } else {
        ctx.response.unauthorized('Invalid session')
      }
    }
  }
}
```

## API Reference

### SessionManager Class

The `SessionManager` class is responsible for managing user sessions.

#### Constructor

```ts
constructor(
  private readonly sessionModel: SessionModelG,
  options?: {
    maxSessions?: number
    tokenPrefix?: string
    secretSize?: number
    invalidMessage?: string
  }
)
```

- `sessionModel`: The Lucid model class for sessions.
- `options`: Optional configurations for the session manager.
  - `maxSessions`: Maximum number of sessions per user (default: 3).
  - `tokenPrefix`: Prefix for the session token (default: 'oat_').
  - `secretSize`: Size of the secret token (default: 64).
  - `invalidMessage`: Message for invalid sessions (default: 'Not a valid session').

#### Methods

- `create(user: LucidRow & { id: number }, options?: { expiresIn?: string | number; client?: TransactionClientContract })`: Creates a new session for the user.
- `authenticate(ctx: HttpContext)`: Authenticates a session from the request context.