/**
 * Creates a function that retrieves string values from a specified object.
 *
 * This function takes an object as input and returns a new function.
 * The returned function acts as a getter, specifically designed to retrieve
 * string values from the original object based on a provided key.
 * If the value associated with the key in the object is not a string,
 * or if the key does not exist, the getter function will return `null`.
 *
 * @param {Record<string, unknown>} obj - The object from which to retrieve string values.
 *                                        Keys are expected to be strings, and values can be of any type.
 * @returns {(key: KEYS) => string | null} A getter function.
 *                                          This function takes a key of type `KEYS` and returns
 *                                          the corresponding string value from the original `obj` if it's a string,
 *                                          otherwise it returns `null`.
 *                                          The type `KEYS` is inferred from the context where this function is used,
 *                                          allowing for type-safe key access in the returned getter.
 *
 * @example
 * const myObject = { name: 'John', age: 30, city: 'New York' };
 * const getString = createStringGetter(myObject);
 *
 * console.log(getString('name'));  // Output: "John"
 * console.log(getString('city'));  // Output: "New York"
 * console.log(getString('age'));   // Output: null (because age is a number, not a string)
 * console.log(getString('country')); // Output: null (because 'country' key does not exist)
 */
export const createStringGetter = <KEYS extends string>(
  obj: Record<string, unknown>
): ((key: KEYS) => string | null) => {
  return (key: KEYS): string | null => {
    const value = obj[key]

    if (typeof value !== 'string') return null

    return value
  }
}
