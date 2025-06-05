/**
 * _murmurHash3_x86_32_numeric: Core 32-bit MurmurHash3 logic.
 * This is an internal helper function.
 *
 * @param input The string to hash.
 * @param seed An optional seed for the hash. Defaults to 0.
 * @returns A 32-bit unsigned numeric hash.
 */
const murmurHash = (input: string, seed: number = 0): number => {
  const encoder = new TextEncoder()
  const data = encoder.encode(input) // Convert string to UTF-8 bytes
  const nblocks = Math.floor(data.length / 4)

  let h1 = seed >>> 0 // Ensure seed is an unsigned 32-bit integer

  const c1 = 0xcc9e2d51
  const c2 = 0x1b873593

  // Helper for 32-bit left rotation
  const rotl32 = (x: number, r: number): number => {
    return (x << r) | (x >>> (32 - r))
  }

  // --- Process body in 4-byte chunks ---
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  for (let i = 0; i < nblocks; i++) {
    let k1 = view.getInt32(i * 4, true) // Read 4 bytes as little-endian

    k1 = Math.imul(k1, c1)
    k1 = rotl32(k1, 15)
    k1 = Math.imul(k1, c2)

    h1 ^= k1
    h1 = rotl32(h1, 13)
    h1 = Math.imul(h1, 5) + 0xe6546b64
  }

  // --- Process tail (remaining bytes) ---
  let k1 = 0
  const tailIndex = nblocks * 4
  switch (
    data.length & 3 // data.length % 4
  ) {
    case 3:
      k1 ^= data[tailIndex + 2] << 16
    // falls through
    case 2:
      k1 ^= data[tailIndex + 1] << 8
    // falls through
    case 1:
      k1 ^= data[tailIndex]
      k1 = Math.imul(k1, c1)
      k1 = rotl32(k1, 15)
      k1 = Math.imul(k1, c2)
      h1 ^= k1
  }

  // --- Finalization ---
  h1 ^= data.length // Mix in the length of the data

  // Finalization mix (MurmurHash3 fmix32)
  h1 ^= h1 >>> 16
  h1 = Math.imul(h1, 0x85ebca6b)
  h1 ^= h1 >>> 13
  h1 = Math.imul(h1, 0xc2b2ae35)
  h1 ^= h1 >>> 16

  return h1 >>> 0 // Return unsigned 32-bit hash
}

/**
 * tinyHash: The function under test.
 * Generates a non-cryptographic hash string from an input string.
 * This version produces an effectively 64-bit hash by concatenating two
 * 32-bit MurmurHash3 results (each derived with a different seed).
 *
 * The resulting hash is a base36 string of 12 characters (0-9, a-z).
 * This significantly reduces collision probability compared to a single 32-bit hash.
 *
 * @param input The string to hash.
 * @param seed An optional base seed for the hash. Defaults to 0.
 * Two internal seeds will be derived from this.
 * @returns A 12-character base36 encoded hash string.
 */
export const tinyHash = (input: string, seed: number = 0): string => {
  // Derive two distinct seeds for the two 32-bit hash parts
  const seed1 = seed >>> 0
  // Use a well-known constant (e.g., from Knuth's multiplicative hashing / golden ratio)
  // to XOR with the original seed for better seed differentiation for the second hash part.
  // This helps ensure the two 32-bit hash computations are more independent.
  const seed2 = (seed ^ 0x9e3779b9) >>> 0 // 0x9e3779b9 is related to the golden ratio prime

  // Generate two 32-bit hashes
  const hashPart1Numeric = murmurHash(input, seed1)
  const hashPart2Numeric = murmurHash(input, seed2)

  // Convert each numeric hash to a base36 string, padded to 6 characters
  // (2^32 - 1).toString(36) is "zik0zj" (6 chars)
  const stringPart1 = hashPart1Numeric.toString(36).padStart(6, '0')
  const stringPart2 = hashPart2Numeric.toString(36).padStart(6, '0')

  // Concatenate the two parts to form a 12-character hash string
  return stringPart1 + stringPart2
}
