import { cuid } from '@adonisjs/core/helpers'
import Rand, { PRNG } from 'rand-seed'

export const seedRand = (seed: string): number => {
  const rand = new Rand(seed, PRNG.xoshiro128ss)
  return rand.next()
}

export const seedRandRange = (min: number, max: number, seed: string | number): number => {
  const seededRandom = typeof seed === 'string' ? seedRand(seed) : seed

  return Math.floor(seededRandom * (max - min) + min)
}

const shuffle = (array: string[], seed: string) => {
  const rand = new Rand(seed, PRNG.xoshiro128ss)
  let currentIndex = array.length
  while (currentIndex > 0) {
    const randomIndex = Math.floor(rand.next() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  return array
}

export const shuffleString = (data: string, seed?: string): string => {
  const selectedSeed = seed ?? cuid()

  const dataLength = data.length

  if (dataLength < 10) {
    return data
  }

  const splittedData = [...data.split('')]

  const intSeed = seedRand(selectedSeed)

  const newLength = seedRandRange(Math.ceil(dataLength / 2), dataLength, intSeed)

  return shuffle(splittedData, selectedSeed).slice(0, newLength).join('')
}
