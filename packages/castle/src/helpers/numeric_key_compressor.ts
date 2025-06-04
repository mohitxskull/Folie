export type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { [key: string]: JsonValue }

type Processed<T> = T extends null
  ? null
  : T extends ReadonlyArray<infer U> // Handles both Array<U> and ReadonlyArray<U>
    ? Processed<U>[]
    : T extends object
      ? { [key: number]: Processed<T[keyof T]> } // T[keyof T] is a union of all possible value types in T
      : T

interface TransformationResult<T extends JsonValue> {
  propertyMap: Record<number, string>
  transformedJson: Processed<T>
}

/**
 * Transforms a JSON-like object by replacing its string property keys with unique numeric IDs.
 * It also returns a map of these IDs back to their original string property names.
 *
 * @param originalJson The input JSON-like object or array, constrained by JsonValue.
 * @returns An object containing the propertyMap (ID to original name) and the type-safe transformedJson.
 */
export const numericKeyCompressor = <T extends JsonValue>(
  originalJson: T
): TransformationResult<T> => {
  const propertyToIdMap = new Map<string, number>()
  const idToPropertyMap: Record<number, string> = {}
  let nextId = 0

  function getPropertyId(propertyName: string): number {
    if (!propertyToIdMap.has(propertyName)) {
      const newId = nextId++
      propertyToIdMap.set(propertyName, newId)
      idToPropertyMap[newId] = propertyName
    }
    return propertyToIdMap.get(propertyName)!
  }

  function transform<CV extends JsonValue>(currentValue: CV): Processed<CV> {
    if (Array.isArray(currentValue)) {
      // If it's an array, transform each element
      // Type assertion needed because .map returns Processed<CV[number]>[] which TS needs help with for Processed<CV>
      return currentValue.map((item) => transform(item)) as Processed<CV>
    } else if (typeof currentValue === 'object' && currentValue !== null) {
      // If it's an object (and not null), transform its keys
      const newObj: Record<number, Processed<JsonValue>> = {} // General type for values
      for (const key in currentValue) {
        if (Object.prototype.hasOwnProperty.call(currentValue, key)) {
          const propertyId = getPropertyId(key)
          // currentValue[key] is JsonValue, transform(currentValue[key]) is Processed<JsonValue>
          newObj[propertyId] = transform(currentValue[key])
        }
      }
      return newObj as Processed<CV> // Assert to specific Processed type for the object
    } else {
      // If it's a primitive value or null, return it as is
      return currentValue as Processed<CV> // Primitives and null map to themselves in Processed<T>
    }
  }

  const transformedJsonData = transform(JSON.parse(JSON.stringify(originalJson)))

  return {
    propertyMap: idToPropertyMap,
    transformedJson: transformedJsonData,
  }
}
