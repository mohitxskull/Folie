import crypto from 'node:crypto'

export const simpleHash = (data: string) => {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = crypto.createHash('sha256').update(dataBuffer).digest()
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
