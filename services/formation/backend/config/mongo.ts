/* eslint-disable @typescript-eslint/naming-convention */

import env from '#start/env'
import { FieldSchema } from '#validators/field'
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
  status: 'inactive' | 'active' | 'deleted'

  slug: string
  name: string

  captcha: {
    public: string
    private: string
  } | null

  schema: {
    version: number
    hash: string
    fields: FieldSchema[]
    createdAt: Date
    updatedAt: Date
  }[]

  activeSchema: number

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
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

    schema: rest.schema.map(({ version, hash, fields, createdAt, updatedAt }) => ({
      version,
      hash,
      fields,

      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })),

    deletedAt: rest.deletedAt ? rest.deletedAt.toISOString() : null,
  }
}

export const serializePublicForm = (object: WithId<FormCollectionSchema>) => {
  const serialized = serializeForm(object)

  const activeSchema = serialized.schema.find((e) => e.version === serialized.activeSchema)

  if (!activeSchema) {
    throw new Error("Active schema can't be found", {
      cause: {
        formId: serialized.slug,
      },
    })
  }

  return {
    id: serialized.id,
    captcha: serialized.captcha,
    fields: activeSchema.fields,
  }
}
