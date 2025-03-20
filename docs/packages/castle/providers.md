# Providers

## Migration Provider

The `MigrationProvider` is responsible for automatically running database migrations every time the application starts in a web environment.

### Usage

1. **Register the provider** in your AdonisJS application configuration:

```ts
// adonisrc.ts
providers: [
  // other providers
  () => import('@folie/castle/providers/migration_provider'),
]
```

2. **Functionality**:
   - The `start` method checks if the application environment is `web`.
   - If true, it boots the Ace commands and runs the `migration:run` command with the `--force` flag.
   - If the migration command is not found or an error occurs, it logs the error and terminates the application.

## Extended Request Validator Provider

The `RequestValidatorProvider` integrates VineJS validators with AdonisJS HTTP requests, allowing you to validate request data including query parameters.

### Usage

1. **Register the provider** in your AdonisJS application configuration:

```ts
// adonisrc.ts
providers: [
  // other providers
  () => import('@folie/castle/provider/request_validator_provider'),
]
```

2. **Functionality**:
  - Adds queries in `query` property in `validateUsing` context.

3. **Example**:

```ts
export default class Controller {
  input = vine.compile(
    vine.object({
      query: vine.object({
        page: vine.number().min(1).max(100).default(1),
        limit: vine.number().min(1).max(100).default(10),
      }),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)
  })
}
```
