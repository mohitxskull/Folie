import { defineConfig, store, drivers } from '@adonisjs/cache'
import { superjson } from '@folie/castle/miscellaneous/super_json'

const cacheConfig = defineConfig({
  default: 'default',

  stores: {
    default: store().useL1Layer(drivers.memory()),
  },
  serializer: {
    deserialize: superjson.parse,
    serialize: superjson.stringify,
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
