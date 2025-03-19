# Squid Package

## Overview

The Squid package provides a robust and customizable way to generate and decode unique identifiers (UUIDs) for various entities in your application. It leverages a secret key for hashing and allows for custom configurations such as prefix, minimum length, and dictionary for encoding.

## Installation

To install the Squid package, use the following command:

```bash
pnpm install @folie/squid
```
npm
## Usage

### Configuration

First, you need to configure the Squid module with a secret key. This key is used to seed the hashing process.

```ts
// /config/squid.ts

import env from '#start/env'
import { SquidModule } from '@folie/squid'

const squidModule = new SquidModule(env.get('SQUID_KEY'))

export const squid = squidModule.group({
  user: {
    prefixBase: 'usr',
  },
  session: {
    prefixBase: 'ses',
  },
  note: {
    prefixBase: 'not',
  },
  tag: {
    prefixBase: 'tag',
  },
})
```

### Model Integration

You can integrate Squid with your models to generate and decode UUIDs. Below is an example of how to use Squid in a User model.

```ts
// /models/user.ts

export default class User extends BaseModel {
  static table = castle.table.user()

  // Serialize =============================

  static $serialize(row: User) {
    return {
      id: squid.user.encode(row.id),

      firstName: row.firstName,
      lastName: row.lastName,

      email: row.email,

      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
      verifiedAt: serializeDT(row.verifiedAt),
    }
  }

  // Omitted
}
```

### Encoding and Decoding

You can encode and decode numerical IDs using the Squid instance.

#### Encoding

```ts
const userId = 12345
const encodedId = squid.user.encode(userId)
console.log(encodedId) // Output: usr_xxxxxxx
```

#### Decoding

```ts
const encodedId = 'usr_xxxxxxx'
const userId = squid.user.decode(encodedId)
console.log(userId) // Output: 12345
```

### Schema Validation

Squid provides a schema for validating UUIDs using the `vine` library.

```ts
input = vine.compile(
  vine.object({
    params: vine.object({
      userId: squid.user.schema,
    }),
  })
)
```

## API Reference

### SquidModule

#### `constructor(secret: string)`

Initializes a new instance of the SquidModule class with the provided secret key.

#### `create(params: SquidParams): Squid`

Creates a new Squid instance with the provided parameters.

#### `group<T extends Record<string, SquidParams>>(params: T): Record<keyof T, Squid>`

Creates a group of Squid instances with the provided parameters.

### Squid

#### `constructor(secret: Secret<string>, params: SquidParams)`

Initializes a new instance of the Squid class with the provided secret and configuration parameters.

#### `encode(id: number): string`

Encodes a given numerical ID into a UUID string.

#### `decode(uuid: string): number`

Decodes a given UUID string into its original numerical ID.

#### `schema: vine.Schema`

Returns a schema for validating Squid UUIDs.

### SquidParams

Type definition for Squid configuration parameters.

```ts
export type SquidParams = {
  prefixBase: string
  minLength?: number
  prefixConnector?: string
  dictionary?: string
}
```

## Error Handling

The Squid package throws errors in the following scenarios:

- If the prefix contains the connector character.
- If the dictionary contains fewer than 5 characters or fewer than 5 unique characters.
- If the UUID length is less than the configured minimum length.
- If the UUID does not start with the configured prefix.
- If the UUID is invalid or cannot be decoded.

## Conclusion

The Squid package provides a flexible and secure way to generate and decode unique identifiers for your application. With customizable configurations and built-in validation, it ensures that your IDs are both unique and consistent.
