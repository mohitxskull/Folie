import { useRouter } from 'next/router.js'

export const useParams = <KEYS extends string>() => {
  const router = useRouter()

  return {
    isReady: router.isReady,
    param: (key: KEYS) => {
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
