import { ObjectId } from 'mongodb'

const hexRegex = /^[0-9a-fA-F]{24}$/ // Regex to check for 24 hex characters

export const isObjectId = (value: string): boolean => {
  if (typeof value !== 'string' || value.length !== 24) {
    return false
  }

  if (!hexRegex.test(value)) {
    return false
  }

  try {
    new ObjectId(value)
    return true
  } catch (error) {
    return false
  }
}
