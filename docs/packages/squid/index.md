# Squid

*Squid* is a JavaScript package designed to generate unique and secure identifiers (UUIDs) with customizable prefixes and character sets.

### Key Features

* **Secure:** Leverages a cryptographically secure random number generator for creating UUIDs.
* **Configurable:** Allows customization of prefixes, minimum length, and character set for generated UUIDs.
* **Decodable:** Provides a method to decode generated UUIDs back to their original numeric IDs.
* **Validation:** Enforces valid UUID format during decoding, including minimum length and prefix checks.
* **Type Safety:** Utilizes AdonisJS `Secret` type for secure management of secret keys.

### Installation

To install *Squid* in your project using pnpm, run the following command:

```bash
pnpm add @folie/squid
```

### Usage

**1. Creating a Squid Instance:**

```typescript:line-numbers
import { Secret } from '@adonisjs/core/helpers'
import { Squid } from '@folie/squid'

const secret = new Secret('your_secret_key') // Replace with your actual secret key

const mySquid = new Squid(secret, {
  prefix: 'my_app_', // Prefix for generated UUIDs
  minLength: 24,    // Minimum length of the UUID (default: 22)
  dictionary: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', // Custom character set (default: alphanumeric + numbers)
});
```

**2. Generating a UUID:**

The `encode` method generates a unique UUID based on the provided numeric ID:

```typescript:line-numbers
const id = 123456;
const encodedUuid = mySquid.encode(id);

console.log(encodedUuid); // Output: my_app_M3JHGGIk... (example)
```

**3. Decoding a UUID:**

The `decode` method retrieves the original numeric ID from a valid encoded UUID:

```typescript:line-numbers
const decodedId = mySquid.decode(encodedUuid);

console.log(decodedId); // Output: 123456
```

**4. Error Handling:**

The `decode` method throws errors for invalid UUIDs, including:

* Invalid length (less than the minimum allowed length)
* Incorrect prefix
* Invalid UUID format

The error message provides details about the issue and the decoded data (if available) for easier debugging.

**5. Integration with Validation libraries:**

The `Squid` class offers a `schema` property that can be used with validation libraries like AdonisJS `Vine`. This allows you to define schema rules for validating incoming UUIDs within your application.

```typescript:line-numbers
import vine from '@vinejs/vine'
import { Squid } from '@folie/squid'

// Example usage with AdonisJS validation
const schema = vine.compile(
  vine.object({
    userId: userSquid.schema,
  })
)

const payload = await schema.validate({ userId: encodedUuid });
```

**6. Factory Pattern (Optional):**

The `SquidFactory` class (provided for convenience) facilitates creating multiple `Squid` instances with different configurations using a shared secret key.

```typescript:line-numbers
import { SquidFactory } from '@folie/squid'

const secret = Secret.value('your_secret_key');
const factory = new SquidFactory(secret);

const userSquid = factory.create({
  prefix: 'usr',
});

const reasonSquid = factory.create({
  prefix: 'rea',
})
```

### Security Considerations

* Ensure the secret key used for generating UUIDs is kept secure and never exposed in your codebase.
* Consider using environment variables or secure configuration management for storing the secret key.
* Please keep in mind that with sufficient effort, someone could reverse-engineer the generated UUIDs and discover the original numeric IDs. Therefore, do not use this for sensitive information.