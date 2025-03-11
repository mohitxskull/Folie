import prettyHrtime from 'pretty-hrtime'
import type { Colors } from '@poppinss/colors/types'
import { RendererContract } from '@poppinss/cliui/types'
import { ConsoleRenderer } from '@poppinss/cliui'
import colors from '@poppinss/colors'

/**
 * Returns the colors instance based upon the environment.
 *
 * - The "raw" option returns the colors instance that prefix the color
 *   transformations as raw text
 * - The "silent" option returns the colors instance that performs no
 *   color transformations
 */
function useColors(options: { raw?: boolean; silent?: boolean } = {}): Colors {
  if (options.raw) {
    return colors.raw()
  }

  if (options.silent) {
    return colors.silent()
  }

  return colors.ansi()
}

export class Action {
  #startTime?: [number, number]

  /**
   * Action message
   */
  #message: string

  /**
   * Reference to the colors implementation
   */
  #colors?: Colors

  /**
   * The renderer to use for writing to the console
   */
  #renderer?: RendererContract

  constructor(message: string) {
    this.#message = message
    this.#startTime = process.hrtime()
  }

  /**
   * Format label
   */
  #formatLabel(label: string, color: keyof Colors) {
    label = this.getColors()[color](`${label.toUpperCase()}:`)

    return label
  }

  /**
   * Format message
   */
  #formatMessage(message: string) {
    return message
  }

  /**
   * Format the suffix
   */
  #formatSuffix(message: string) {
    message = `(${message})`
    return this.getColors().dim(message)
  }

  /**
   * Format error
   */
  #formatError(error: string | Error) {
    let message = typeof error === 'string' ? error : error.stack || error.message

    return `\n    ${message
      .split('\n')
      .map((line) => {
        return `       ${this.getColors().red(line)}`
      })
      .join('\n')}`
  }

  #time() {
    return prettyHrtime(process.hrtime(this.#startTime))
  }

  /**
   * Returns the renderer for rendering the messages
   */
  getRenderer(): RendererContract {
    if (!this.#renderer) {
      this.#renderer = new ConsoleRenderer()
    }

    return this.#renderer
  }

  /**
   * Define a custom renderer.
   */
  useRenderer(renderer: RendererContract): this {
    this.#renderer = renderer
    return this
  }

  /**
   * Returns the colors implementation in use
   */
  getColors(): Colors {
    if (!this.#colors) {
      this.#colors = useColors()
    }

    return this.#colors
  }

  /**
   * Define a custom colors implementation
   */
  useColors(color: Colors): this {
    this.#colors = color
    return this
  }

  /**
   * Prepares the message to mark action as successful
   */
  prepareCompleted() {
    const formattedLabel = this.#formatLabel('completed', 'green')
    const formattedMessage = this.#formatMessage(this.#message)
    const formattedTime = this.#formatSuffix(this.#time())

    return `${formattedLabel} ${formattedMessage} ${formattedTime}`
  }

  /**
   * Mark action as completed
   */
  completed() {
    this.getRenderer().log(this.prepareCompleted())
  }

  /**
   * Prepares the message to mark action as skipped
   */
  prepareSkipped(skipReason?: string) {
    const formattedLabel = this.#formatLabel('skipped', 'green')
    const formattedMessage = this.#formatMessage(this.#message)

    let logMessage = `${formattedLabel} ${formattedMessage}`

    if (skipReason) {
      logMessage = `${logMessage}  ${this.#formatSuffix(skipReason)}`
    }

    return logMessage
  }

  /**
   * Mark action as skipped. An optional skip reason can be
   * supplied
   */
  skipped(skipReason?: string) {
    this.getRenderer().log(this.prepareSkipped(skipReason))
  }

  /**
   * Prepares the message to mark action as failed
   */
  prepareFailed(error: string | Error) {
    const formattedLabel = this.#formatLabel('failed', 'red')
    const formattedMessage = this.#formatMessage(this.#message)
    const formattedError = this.#formatError(error)
    const formattedTime = this.#formatSuffix(this.#time())

    return `${formattedLabel}    ${formattedMessage}  ${formattedError} ${formattedTime}`
  }

  /**
   * Mark action as failed. An error message is required
   */
  failed(error: string | Error) {
    this.getRenderer().logError(this.prepareFailed(error))
  }

  prepareStarted() {
    const formattedLabel = this.#formatLabel('started', 'blue')
    const formattedMessage = this.#formatMessage(this.#message)

    return `\n${formattedLabel}   ${formattedMessage}`
  }

  started() {
    this.getRenderer().log(this.prepareStarted())
  }

  prepareProgress(progress: string) {
    const formattedLabel = this.#formatLabel('progress', 'yellow')
    const formattedMessage = this.#formatMessage(this.#message)
    const formattedProgress = this.#formatSuffix(progress)
    const formattedTime = this.#formatSuffix(this.#time())

    return `\n${formattedLabel}  ${formattedMessage} ${formattedProgress} ${formattedTime}`
  }

  progress(message: string) {
    this.getRenderer().log(this.prepareProgress(message))
  }
}
