const t = (name: string, column?: string) => {
  if (column) {
    return `${name}.${column}`
  } else {
    return name
  }
}

export const table = {
  USER: t.bind(null, 'users'),
  SESSION: t.bind(null, 'sessions'),
  SECURE_OBJECT: t.bind(null, 'secure_objects'),
}

export type Tables = keyof typeof table
