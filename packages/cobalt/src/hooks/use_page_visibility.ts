import { useState, useEffect } from 'react'

export type VisibilityState = 'visible' | 'hidden' | 'prerender' | 'unloaded' | undefined

const usePageVisibility = (): VisibilityState => {
  const [visibilityState, setVisibilityState] = useState<VisibilityState>(
    typeof document !== 'undefined' ? document.visibilityState : undefined
  )

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibilityState(document.visibilityState)
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  })

  return visibilityState
}

export default usePageVisibility
