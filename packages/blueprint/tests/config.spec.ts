import { test } from '@japa/runner'
import { defineConfig } from '../src/define_config.js'

test.group('Config', () => {
  test('add two numbers', ({ assert }) => {
    const config = defineConfig({
      groups: {
        private: new RegExp('/api/internal/v[12]/private/'),
      },
    })

    const privateArray = config.groups['private']

    if (!privateArray) {
      return assert.fail('Private array not found')
    }

    assert.equal(privateArray instanceof RegExp, true)

    assert.equal(privateArray.test('/api/internal/v1/private/'), true)
    assert.equal(privateArray.test('/api/internal/v2/private/'), true)
  })
})
