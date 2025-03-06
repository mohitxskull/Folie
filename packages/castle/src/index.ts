import { CastleConfig } from './types.js'

export class Castle {
  #config: CastleConfig

  constructor(params: { config: CastleConfig }) {
    this.#config = params.config
  }

  get table() {
    return this.#config.table
  }

  get pivot() {
    return this.#config.pivot
  }
}
