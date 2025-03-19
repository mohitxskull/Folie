# Providers

## MigrationProvider

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

## RequestValidatorProvider

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
   - Adds a `validateUsing` method to the `Request` object.
   - This method can be used to validate request data (body, files, params, headers, cookies, and query) using VineJS validators.
   - Supports custom error reporters and messages providers for each request.

3. **Example**:

```ts
export default class Controller {
  input = vine.compile(
    vine.object({
      name: TagNameSchema,
      description: TagDescriptionSchema.optional(),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)
  })
}
```
