import { LucidRow, ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { promiseMap } from '@folie/lib'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

const paginationMetaValidator = vine.compile(
  vine.object({
    total: vine.number(),
    perPage: vine.number(),
    currentPage: vine.number(),
    lastPage: vine.number(),
    firstPage: vine.number(),
    firstPageUrl: vine.string(),
    lastPageUrl: vine.string(),
    nextPageUrl: vine.string().optional(),
    previousPageUrl: vine.string().nullable(),
  })
)

const serializePage = async <MODAL extends LucidRow, TRANSFER>(
  paginated: ModelPaginatorContract<MODAL>,
  transferFunc: (model: MODAL) => TRANSFER | Promise<TRANSFER>
) => {
  const serialized = paginated.toJSON()

  return {
    data: await promiseMap(serialized.data, async (model) => await transferFunc(model as MODAL)),
    meta: await paginationMetaValidator.validate(serialized.meta),
  }
}

function serializeDT(dt: DateTime): string
function serializeDT(dt: DateTime | null): string | null
function serializeDT(dt: any): any {
  if (dt instanceof DateTime) {
    return dt.toISO()
  } else {
    return null
  }
}

export { serializeDT, serializePage }
