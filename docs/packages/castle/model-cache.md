# Model Cache Module

The Model Cache module in the `castle` package provides a caching mechanism for AdonisJS Lucid models. This module helps in reducing database queries by caching model data and related computations. Below is a detailed guide on how to use the Model Cache module.

## Setting Up Model Cache

To set up caching for a Lucid model, you need to create a `ModelCache` instance and define the cache keys you want to use.

```ts
import { ModelCache } from '@folie/castle'

export default class User extends BaseModel {
  // Other model definitions...
  
   $toJSON() {
     return {
       id: this.id,
       firstName: this.firstName,
       lastName: this.lastName,
       email: this.email,
       password: this.password,
       createdAt: this.createdAt,
       updatedAt: this.updatedAt,
       verifiedAt: this.verifiedAt,
     }
   }

  static $cache() {
    return new ModelCache(User, cache.namespace(this.table))
  }

  $cache() {
    return User.$cache().row(this)
  }
}
```

## Example Usage of `$find` and `$findStrict`

To use the model cache, you can retrieve a cached model instance using the `$find` and `$findStrict` methods. The `$find` method retrieves the model instance from the cache or fetches it from the database if not cached. The `$findStrict` method does the same but throws an error if the instance is not found.

```ts
import User from '#models/user'

// Retrieve a user instance by ID and cache it
const user = await User.$cache().$find(1)

if (user) {
  console.log(user) // Cached user instance
}

// Retrieve a user instance by ID and cache it, throws an error if not found
try {
  const strictUser = await User.$cache().$findStrict(1)
  console.log(strictUser) // Cached user instance
} catch (error) {
  console.error('User not found', error)
}
```

## Caching Other Computations

You can cache model instances and related computations using the `$cache` method. For example, to cache a user's metrics:

```ts
// /app/models/user.ts

export default class User extends BaseModel {
  // Omitted

  static $cache() {
    return new ModelCache(User, cache.namespace(this.table), ['metric'])
  }

  $cache() {
    return User.$cache().row(this)
  }

  $metric(this: User) {
    return this.$cache().get({
      key: 'metric',
      factory: async () => {
        const [notes, tags] = await Promise.all([
          this.related('notes').query().count('* as total'),
          this.related('tags').query().count('* as total'),
        ])

        return { notes: notes[0].$extras.total, tags: tags[0].$extras.total }
      },
      parser: async (p) => p,
    })
  }
}
```

```ts
import User from '#models/user'

const user = await User.find(1)

if (user) {
  const metrics = await user.$metric()
  console.log(metrics) // { notes: 10, tags: 5 }
}
```

## Custom Cache Keys

You can define custom cache keys when setting up the `ModelCache` instance. In the example above, the `metric` key is used to cache user metrics.

## Expiring Cache

To expire a cache entry, you can use the `expire` method:

```ts
const userCache = User.$cache()
await userCache.expire({ id: 1, key: 'metric' })
```

## Essential Usage of `$toJSON`

The `$toJSON` method is essential for using the model cache because it converts the model instance to a JSON object, which can be used to retrieve cached data. This method ensures that the model data is serialized correctly before being stored in the cache.

```ts
export default class User extends BaseModel {
  // Other model definitions...

  $toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      verifiedAt: this.verifiedAt,
    }
  }
}
```

In this example, the `$toJSON` method is defined to serialize the `User` model instance into a JSON object. This serialized object is then used to store and retrieve cached data efficiently.