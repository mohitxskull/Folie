/**
 * Represents an enhanced enum with additional utility methods.
 * Provides access to keys, values, reverse lookup, and iteration.
 * @template T A type representing the enum object, where keys are strings and values are strings or numbers.
 */
export class XEnum<T extends Record<string, string | number>> {
  /**
   * An array of the enum keys.
   * @readonly
   */
  public readonly keys: (keyof T)[]

  /**
   * An array of the enum values.
   * @readonly
   */
  public readonly values: T[keyof T][]

  /**
   * The original enum object.
   * @readonly
   */
  public readonly enum: Readonly<T>

  private readonly reverseMap: Map<T[keyof T], keyof T>

  /**
   * Creates a new XEnum instance.
   * @param enumObj The enum object to enhance.
   * @example
   * ```typescript
   * const Color = new XEnum({ RED: 'red', GREEN: 'green', BLUE: 'blue' });
   * ```
   */
  constructor(enumObj: T) {
    this.enum = Object.freeze({ ...enumObj })
    this.keys = Object.keys(enumObj) as (keyof T)[]
    this.values = Object.values(enumObj) as T[keyof T][]
    this.reverseMap = new Map()

    this.values.forEach((value, index) => {
      this.reverseMap.set(value, this.keys[index])
    })
  }

  /**
   * Gets the value associated with a given key.
   * @param key The enum key.
   * @returns The corresponding enum value.
   * @example
   * ```typescript
   * const value = Color.keyof('RED'); // 'red'
   * ```
   */
  keyof(key: keyof T): T[keyof T] {
    return this.enum[key]
  }

  key(key: keyof T) {
    return key
  }

  /**
   * Gets the key associated with a given value.
   * @param value The enum value.
   * @returns The corresponding enum key, or undefined if the value is not found.
   * @example
   * ```typescript
   * const key = Color.valueof('green'); // 'GREEN'
   * const unknownKey = Color.valueof('purple'); // undefined
   * ```
   */
  valueof(value: T[keyof T]): keyof T | undefined {
    return this.reverseMap.get(value)
  }

  /**
   * Checks if the enum has a given key (or one of the utility properties).
   * @param key The key to check.
   * @returns True if the enum has the key, false otherwise.
   * @example
   * ```typescript
   * console.log("RED" in Color); // true
   * console.log("random" in Color); // false
   * console.log("keys" in Color); // true
   * ```
   */
  has(key: string | symbol): boolean {
    return (
      key in this.enum || key === 'keys' || key === 'values' || key === 'keyof' || key === 'valueof'
    )
  }

  /**
   * Gets the value associated with a given key. Alias for keyof().
   * @param key The enum key.
   * @returns The corresponding enum value.
   * @example
   * ```typescript
   * const value = Color.get('RED'); // 'red'
   * ```
   */
  get(key: keyof T): T[keyof T] {
    return this.enum[key]
  }

  /**
   * Iterates over the enum entries.
   * @returns An iterator that yields [key, value] pairs.
   * @example
   * ```typescript
   * for (const [key, value] of Color) {
   *   console.log(`${key}: ${value}`);
   * }
   * // RED: red
   * // GREEN: green
   * // BLUE: blue
   * ```
   */
  *[Symbol.iterator](): IterableIterator<[keyof T, T[keyof T]]> {
    for (const key of this.keys) {
      yield [key, this.enum[key]]
    }
  }
}
