import vine from '@vinejs/vine'

export const IPResSchema = vine.compile(
  vine.object({
    status: vine.string(),
    continent: vine.string(),
    continentCode: vine.string(),
    country: vine.string(),
    countryCode: vine.string(),
    region: vine.string(),
    regionName: vine.string(),
    city: vine.string(),
    district: vine.string(),
    zip: vine.string(),
    lat: vine.number(),
    lon: vine.number(),
    timezone: vine.string(),
    offset: vine.number(),
    currency: vine.string(),
    isp: vine.string(),
    org: vine.string(),
    as: vine.string(),
    asname: vine.string(),
    reverse: vine.string(),
    mobile: vine.boolean(),
    proxy: vine.boolean(),
    hosting: vine.boolean(),
  })
)

export const CaptchaResSchema = vine.compile(
  vine.object({
    success: vine.boolean(),
  })
)
