export const ifProps = <PROPS extends object>(params: {
  condition: boolean
  true: PROPS
  false?: PROPS
  merge?: PROPS[]
}) => {
  const merge = params.merge?.reduce((acc, prop) => ({ ...acc, ...prop }), {}) || {}

  if (params.condition) {
    return {
      ...params.true,
      ...merge,
    }
  }

  return params.false ? { ...params.false, ...merge } : merge
}

export const ifProp = <PROPS extends string | number | boolean>(
  condition: boolean,
  cTrue: PROPS,
  cFalse?: PROPS
) => {
  if (condition) {
    return cTrue
  }

  return cFalse
}
