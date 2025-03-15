import {
  getCookie as getCook,
  setCookie as setCook,
  deleteCookie as removeCook,
} from 'cookies-next'
import { useRouter } from 'next/router.js'

export class GateNextClient<CookieKeys extends Record<string, string>, ParamKeys extends string[]> {
  cookieKeys: CookieKeys
  paramKeys: ParamKeys

  constructor(params: { cookieKeys: CookieKeys; paramKeys: ParamKeys }) {
    this.cookieKeys = params.cookieKeys
    this.paramKeys = params.paramKeys
  }

  useParams = () => {
    const router = useRouter()

    return {
      isReady: router.isReady,
      param: <K extends ParamKeys[number]>(key: K): string => {
        if (!router.isReady) {
          return ''
        }

        const value = router.query[key]

        if (typeof value !== 'string') {
          return ''
        }

        return value
      },
    }
  }

  getCookie = (key: keyof CookieKeys) => {
    const cook = getCook(this.cookieKeys[key])

    if (typeof cook !== 'string') {
      return null
    }

    return cook
  }

  removeCookie = (key: keyof CookieKeys) => removeCook(this.cookieKeys[key])

  setCookie = (key: keyof CookieKeys, value: string) => {
    setCook(this.cookieKeys[key], value)
  }
}
