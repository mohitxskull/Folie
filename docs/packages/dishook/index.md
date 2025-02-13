# DisHook

*DisHook* is a TypeScript package designed to streamline sending form data to Discord webhooks. It provides a user-friendly API for constructing and sending Discord messages with rich embeds containing the submitted data.

## Key Features

* **Simplified webhook integration:** *DisHook* abstracts away the complexities of interacting with Discord webhooks, allowing you to focus on building your forms and handling submissions.
* **Type-safe data handling:** *DisHook* utilizes TypeScript to ensure type safety throughout the submission process, minimizing errors and improving code maintainability.
* **Customizable messages:** *DisHook* allows you to construct informative and visually appealing Discord messages using embeds. Submitted data is presented in a clear and organized manner.
* **Optional Captcha verification:** *DisHook* supports integrating Google reCaptcha to add an extra layer of security to your forms and prevent spam submissions.
* **IP information retrieval (Optional):** *DisHook* can optionally retrieve and send IP information for the submitting user, providing additional context for your Discord messages.

## Installation

To install *DisHook* in your project using pnpm, run the following command:

```bash
pnpm add @folie/dishook
```

> [!NOTE]
> *DisHook* has a dependency on `node-fetch`. Ensure you have it installed as well:
>
> ```bash
> pnpm add node-fetch
> ```

## Usage

*DisHook* provides a straightforward API for sending form submissions to Discord webhooks. Here's a breakdown of its functionalities:

**1. Creating a *DisHook* instance:**

```typescript:line-numbers
import { DisHook } from '@folie/dishook';

const myDisHook = new DisHook({
  url: 'YOUR_DISCORD_WEBHOOK_URL', // Replace with your actual webhook URL
  name: 'My Form Submission Bot', // Name for the DisHook instance (optional)
  bot: {
    username: 'My Form Bot', // Username for the Discord messages
  },
  captcha: 'YOUR_GOOGLE_RECAPTCHA_SECRET', // Optional Captcha secret for verification
});
```

**2. Submitting data:**

The `send` method is used to send form data to the configured Discord webhook. You can submit data in two formats:

**Simple format:**

```typescript:line-numbers{7}
const payload = {
  name: 'John Doe',
  email: 'johndoe@example.com',
  message: 'This is a test submission',
};

const response = await myDisHook.send({ type: 'simple', value: payload });

if (response.success) {
  console.log('Submission sent successfully!');
} else {
  console.error('Submission failed:', response.message);
}
```

**Complex format:**

For more control over message construction, you can use the complex format and provide an array of pre-built `EmbedBuilder` objects from your application:

```typescript:line-numbers
import { EmbedBuilder } from '@folie/dishook';

const complexEmbeds = [
  new EmbedBuilder()
    .setTitle('Submission Details')
    .addField({ name: 'Inline field title', value: 'Some value here', inline: true })
];

const response = await myDisHook.send({ type: 'complex', value: complexEmbeds });
```

The `send` method accepts two arguments:

* **payload**: An object containing the data to be sent to Discord. 
    * For the simple format, the object represents key-value pairs for the message fields.
    * For the complex format, an array of pre-built `EmbedBuilder` objects is used to construct the message.
* **options**: An optional object with additional options:
    * **ip**: The user's IP address (retrieved from your server-side code) (IPV4 required)
    * **token**: Captcha token for verification (if using reCaptcha)

The `send` method returns a promise that resolves to an object with the following properties:

* **success**: A boolean indicating whether the submission was successful.
* **message**: An optional message containing any errors encountered during the submission process.
* **error**: An optional error object in case of unexpected issues.

**3. Customizing Messages:**

It provides the `EmbedBuilder` class for constructing messages with titles, fields, and footers. You can utilize this class to customize the presentation of your submitted data within Discord embeds.

```typescript:line-numbers
const exampleEmbed = new EmbedBuilder()
	.setColor("Blue")
	.setTitle('Some title')
	.setURL('https://google.com/')
	.setDescription('Some description here')
	.setThumbnail('https://google.com//AfFp7pu.png')
	.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
	.setImage('https://google.com//AfFp7pu.png')
```

**4. Captcha Verification:**

If you provide a `captcha` secret during *DisHook* initialization, the `send` method will require a `token` from the user in the `options` object. *DisHook* will verify the token's validity using Google reCaptcha'