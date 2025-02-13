import { DisHook } from '../src/index.js'

console.log('Welcome to playground!')

const hook = new DisHook({
  url: 'https://discord.com/api/webhooks/1318784556307841024/6Y67D7l3QrZ3Hl15RK2gkXoZad_mV3Z129vZARAPxZjOjork-LSc210-WDiJZ3OXpt2O',
  name: 'Playground',
  bot: {
    username: 'Dishook',
  },
})

hook.send(
  {
    type: 'simple',
    value: {
      name: 'John Doe',
      email: '7x4dD@example.com',
      message: 'Hello, world!',
      phone: '123-456-7890',
      captcha: '123456',
    },
  },
  {
    ip: '24.48.0.1',
  }
)
