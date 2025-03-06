import type { defineConfig } from './define_config.js'

export type Metadata<T = Record<string, string | number | boolean | null>> = T | null

export type PivotOptions = {
  pivotColumns?: string[]
  localKey?: string
  pivotForeignKey?: string
  relatedKey?: string
  pivotRelatedForeignKey?: string
  pivotTimestamps?:
    | boolean
    | {
        createdAt: string | boolean
        updatedAt: string | boolean
      }
  serializeAs?: string | null
  meta?: any
}

export interface CastleConfig {
  table: ReturnType<typeof defineConfig>['table']
  pivot?: ReturnType<typeof defineConfig>['pivot']
}
