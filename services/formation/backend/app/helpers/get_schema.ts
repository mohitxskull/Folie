import { FormCollectionSchema } from '#config/mongo'

export const getFormSchema = (
  schemas: FormCollectionSchema['schema'],
  type: 'latest' | 'oldest' = 'latest'
) => {
  return schemas.reduce((latest, current) => {
    if (type === 'latest') {
      return latest.version > current.version ? latest : current
    } else {
      return latest.version < current.version ? latest : current
    }
  })
}
