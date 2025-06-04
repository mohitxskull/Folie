import { Readable } from 'node:stream'

export const readableStreamToNodeReadable = <T>(readableStream: ReadableStream<T>): Readable => {
  const reader = readableStream.getReader()

  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read()
        if (done) {
          this.push(null)
        } else {
          this.push(typeof value === 'string' ? value : Buffer.from(String(value)))
        }
      } catch (err) {
        this.destroy(err as Error)
      }
    },
  })
}
