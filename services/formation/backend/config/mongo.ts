/* eslint-disable @typescript-eslint/naming-convention */

import env from '#start/env'
import { DBFieldSchema } from '#validators/field'
import { MongoClient, ObjectId, WithId } from 'mongodb'

export const mongo = new MongoClient(env.get('MONGO_DB_URI'))

const db = mongo.db('formation')

export type SubmissionCollectionSchema = {
  formId: ObjectId

  meta: {
    ip: string | null
    captcha: boolean
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
  status: 'inactive' | 'active' | 'deleted'

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

  const { published } = serialized.schema

  if (!published) {
    throw new Error(
      "Form does not have a published schema, It should't have been passed to serializePublicForm if it's not active",
      {
        cause: {
          form: serialized,
        },
      }
    )
  }

  return {
    id: serialized.id,
    captcha: serialized.captcha,
    fields: published,
  }
}
