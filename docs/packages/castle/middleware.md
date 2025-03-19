# Middleware

## JSON Response Middleware

The JSON Response Middleware is designed to ensure that all responses from the server are in JSON format. This is particularly useful for APIs where clients expect responses in a consistent format, such as JSON. By updating the "Accept" header to always accept "application/vnd.api+json", this middleware forces the internals of the framework, including validator errors or authentication errors, to return a JSON response.

### Implementation

The middleware is implemented in the `force_json_response_middleware.ts` file:

```ts
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Updating the "Accept" header to always accept "application/json" response
 * from the server. This will force the internals of the framework like
 * validator errors or auth errors to return a JSON response.
 */
export default class ForceJsonResponseMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    const headers = request.headers()

    headers.accept = 'application/vnd.api+json'

    return next()
  }
}
```

### Usage

To use this middleware in your AdonisJS application, you need to register it in the middleware stack. This can be done in the `start/kernel.ts` file:

```ts
// Excerpt from: 
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('@folie/castle/middlewares/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])
```

By including the `force_json_response_middleware` in the middleware stack, you ensure that all incoming requests will have their "Accept" header set to "application/vnd.api+json". This guarantees that the responses from the server will be in JSON format, providing a consistent API experience for clients.