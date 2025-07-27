/*
 * This is an auto-generated file. Changes made to this file will be lost.
 * Run `nr ace blueprint:generate` to update it.
 */

export type V1AuthSessionRoute = {
  output: {
    session: {
      id: string
      firstName: string
      lastName: string
      email: string
      createdAt: string
      updatedAt: string
      verifiedAt: string | null
    }
  }
  input: undefined
}

export type V1AuthSignOutRoute = { output: { message: string }; input: undefined }

export type V1AuthSignInRoute = {
  output: { token: string; message: string }
  input: { email: string; password: string }
}

export type V1AuthSignUpRoute = {
  output: { message: string }
  input: {
    email: string
    password: string
    firstName: string
    lastName: string
    confirmPassword: string
  }
}

export type V1AuthVerifyRoute = { output: { message: string }; input: { token: string } }

export type V1AuthPasswordUpdateRoute = {
  output: { message: string }
  input: { oldPassword: string; newPassword: string }
}

export type V1AuthProfileUpdateRoute = {
  output: {
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      createdAt: string
      updatedAt: string
      verifiedAt: string | null
    }
    message: string
  }
  input: { firstName?: string | null | undefined; lastName?: string | null | undefined }
}

export type V1NoteListRoute = {
  output: {
    data: {
      tags: {
        id: string
        userId: string
        slug: string
        name: string
        description: string | null
        createdAt: string
        updatedAt: string
      }[]
      id: string
      userId: string
      title: string
      body: string
      createdAt: string
      updatedAt: string
    }[]
    meta: {
      nextPageUrl?: string | undefined
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
      firstPageUrl: string
      lastPageUrl: string
      previousPageUrl: string | null
    }
  }
  input: {
    query?:
      | {
          filter?: { value?: string | null | undefined } | null | undefined
          limit?: string | number | null | undefined
          page?: string | number | null | undefined
          order?:
            | {
                dir?: 'asc' | 'desc' | null | undefined
                by: 'id' | 'createdAt' | 'updatedAt' | 'title'
              }
            | null
            | undefined
        }
      | null
      | undefined
  }
}

export type V1NoteShowRoute = {
  output: {
    note: {
      id: string
      userId: string
      title: string
      body: string
      createdAt: string
      updatedAt: string
    }
  }
  input: { params: { noteId: string } }
}

export type V1NoteCreateRoute = {
  output: {
    note: {
      id: string
      userId: string
      title: string
      body: string
      createdAt: string
      updatedAt: string
    }
    message: string
  }
  input: undefined
}

export type V1NoteUpdateRoute = {
  output: {
    note: {
      id: string
      userId: string
      title: string
      body: string
      createdAt: string
      updatedAt: string
    }
    message: string
  }
  input: {
    title?: string | null | undefined
    body?: string | null | undefined
    params: { noteId: string }
  }
}

export type V1NoteDeleteRoute = {
  output: {
    note: {
      id: string
      userId: string
      title: string
      body: string
      createdAt: string
      updatedAt: string
    }
    message: string
  }
  input: { params: { noteId: string } }
}

export type V1NoteTagUpdateRoute = {
  output: { message: string }
  input: { params: { noteId: string }; tagId: string; action: 'add' | 'remove' }
}

export type V1TagListRoute = {
  output: {
    data: {
      metric: { notes: number } | null
      id: string
      userId: string
      slug: string
      name: string
      description: string | null
      createdAt: string
      updatedAt: string
    }[]
    meta: {
      nextPageUrl?: string | undefined
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
      firstPageUrl: string
      lastPageUrl: string
      previousPageUrl: string | null
    }
  }
  input: {
    query?:
      | {
          filter?:
            | { value?: string | null | undefined; noteId?: string | null | undefined }
            | null
            | undefined
          limit?: string | number | null | undefined
          page?: string | number | null | undefined
          order?:
            | {
                dir?: 'asc' | 'desc' | null | undefined
                by: 'id' | 'createdAt' | 'updatedAt' | 'name'
              }
            | null
            | undefined
          properties?: { metric?: string | number | boolean | null | undefined } | null | undefined
        }
      | null
      | undefined
  }
}

export type V1TagShowRoute = {
  output: {
    tag: {
      id: string
      userId: string
      slug: string
      name: string
      description: string | null
      createdAt: string
      updatedAt: string
    }
  }
  input: { params: { tagId: string } }
}

export type V1TagCreateRoute = {
  output: {
    tag: {
      id: string
      userId: string
      slug: string
      name: string
      description: string | null
      createdAt: string
      updatedAt: string
    }
    message: string
  }
  input: { description?: string | null | undefined; name: string }
}

export type V1TagUpdateRoute = {
  output: {
    tag: {
      id: string
      userId: string
      slug: string
      name: string
      description: string | null
      createdAt: string
      updatedAt: string
    }
    message: string
  }
  input: {
    name?: string | null | undefined
    description?: string | null | undefined
    params: { tagId: string }
  }
}

export type V1TagDeleteRoute = {
  output: {
    tag: {
      id: string
      userId: string
      slug: string
      name: string
      description: string | null
      createdAt: string
      updatedAt: string
    }
    message: string
  }
  input: { params: { tagId: string } }
}

export type V1PingRoute = { output: { message: string }; input: undefined }
