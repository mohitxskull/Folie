/**
 * Represents a collection of settings.
 * @template T An interface defining the setting keys and their types (number, boolean, or string).
 */
export class SettingService<T extends Record<string, number | boolean | string>> {
  private settings: T

  /**
   * Creates a new Settings instance.
   * @param settings An object containing the initial settings.
   * @throws {TypeError} If any setting value is not a number, boolean, or string.
   * @example
   * ```typescript
   * interface MySettings {
   *   theme: string;
   *   notificationsEnabled: boolean;
   *   volume: number;
   * }
   *
   * const settings = new Settings<MySettings>({
   *   theme: 'dark',
   *   notificationsEnabled: true,
   *   volume: 75,
   * });
   *
   * console.log(settings.get('theme')); // 'dark'
   * ```
   */
  constructor(settings: T) {
    this.settings = settings // Create a shallow copy and freeze it
  }

  /**
   * Gets the value of a specific setting.
   * @param key The key of the setting.
   * @returns The setting value, or undefined if the key is not found.
   * @example
   * ```typescript
   * const theme = settings.get('theme'); // 'dark'
   * const nonExistent = settings.get('foo'); // undefined
   * ```
   */
  get<K extends keyof T>(key: K): T[K] {
    const res = this.settings[key]

    if (res === undefined) {
      throw new Error(`Setting "${String(key)}" not found`)
    }

    return res
  }

  /**
   * Returns a read-only copy of all settings.
   * @returns A read-only object containing all settings.
   * @example
   * ```typescript
   * const allSettings = settings.all();
   * console.log(allSettings.theme); // 'dark'
   * // allSettings.theme = 'light'; // Error: Cannot assign to read only property 'theme'
   * ```
   */
  all(): Readonly<T> {
    return Object.freeze(this.settings)
  }
}
