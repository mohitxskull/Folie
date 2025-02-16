/* eslint-disable @typescript-eslint/naming-convention */

import env from '#start/env'
import { DBFieldSchema } from '#validators/field'
import { MongoClient, ObjectId, WithId } from 'mongodb'

export const mongo = new MongoClient(env.get('MONGO_DB_URI'))

const db = mongo.db('formation')

export type SubmissionCollectionSchema = {
  formId: ObjectId
  schemaVersion: number

  meta?: {
    ip?: string
    [key: string]: string | number | boolean | null | undefined
  }

  fields: Record<string, string | number | boolean | null | undefined>

  submittedAt: Date
}

export const Submission = db.collection<SubmissionCollectionSchema>('submissions')

export const serializeSubmission = (object: WithId<SubmissionCollectionSchema>) => {
  const { _id, ...rest } = object

  return {
    ...rest,
    id: _id.toString(),
    submittedAt: rest.submittedAt.toISOString(),
  }
}

export type FormCollectionSchema = {
  status: { value: 'inactive' | 'active' | 'deleted'; updatedAt: Date }

  name: string

  captcha: {
    public: string
    private: string
  } | null

  schema: {
    published?: DBFieldSchema[]
    draft?: DBFieldSchema[]
  }

  createdAt: Date
  updatedAt: Date
}

export const Form = db.collection<FormCollectionSchema>('forms')

export const serializeForm = (object: WithId<FormCollectionSchema>) => {
  const { _id, ...rest } = object

  return {
    ...rest,
    id: _id.toString(),

    status: {
      value: rest.status.value,
      updatedAt: rest.status.updatedAt.toISOString(),
    },

    captcha: rest.captcha
      ? {
          public: rest.captcha.public,
        }
      : null,

    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
  }
}

export const serializePublicForm = (object: WithId<FormCollectionSchema>) => {
  const serialized = serializeForm(object)

  return {
    id: serialized.id,
    captcha: serialized.captcha,
    fields: serialized.schema,
  }
}
