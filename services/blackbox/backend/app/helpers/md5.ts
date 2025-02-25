import { createHash } from 'node:crypto'

export function md5(str: object | number | string | boolean): string {
  const hash = createHash('md5')
  hash.update(JSON.stringify(str))
  return hash.digest('hex')
}
