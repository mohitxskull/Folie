import stringHelpers from '@adonisjs/core/helpers/string'

export const sleep = async (time: string) => {
  const parsedMs = stringHelpers.milliseconds.parse(time)
  await new Promise((resolve) => setTimeout(resolve, parsedMs))
}
