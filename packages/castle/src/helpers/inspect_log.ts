import { inspect } from 'node:util'

interface InspectLogOptions {
  depth?: number
  colors?: boolean
  showHidden?: boolean
}

export const inspectLog = (
  object: unknown, // Use 'unknown' for better type safety
  options: InspectLogOptions = {}
): void => {
  const { depth = 15, colors = true, showHidden = false } = options

  try {
    console.log(inspect(object, { showHidden, depth, colors }) + '\n') // Append newline
  } catch (error) {
    console.error('Error during inspection:', error)
  }
}
