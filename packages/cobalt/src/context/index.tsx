import { Routes } from '@folie/blueprint-lib'
import { CobaltContextProps, CobaltProvider } from './base.js'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { NavigationProgress, nprogress } from '@mantine/nprogress'
import { Notifications } from '@mantine/notifications'
import { useEffect } from 'react'

export const CobaltContext = <ROUTES extends Routes>(props: CobaltContextProps<ROUTES>) => {
  const startProgress = (url: string) => {
    if (props.navigation?.started) {
      props.navigation.started(url)
    } else {
      nprogress.start()
    }
  }

  const completeProgress = () => {
    if (props.navigation?.completed) {
      props.navigation.completed()
    } else {
      nprogress.complete()
    }
  }

  useEffect(() => {
    props.router.events.on('routeChangeStart', startProgress)
    props.router.events.on('routeChangeComplete', completeProgress)
    props.router.events.on('routeChangeError', completeProgress)

    return () => {
      props.router.events.off('routeChangeStart', startProgress)
      props.router.events.off('routeChangeComplete', completeProgress)
      props.router.events.off('routeChangeError', completeProgress)
    }
  }, [props.router.events])

  return (
    <>
      <CobaltProvider
        value={{
          query: props.cobalt?.query,
        }}
      >
        <MantineProvider
          theme={props.mantine}
          defaultColorScheme={props.config.theme}
          {...(props.config.forceTheme && {
            forceColorScheme: props.config.theme === 'dark' ? 'dark' : 'light',
          })}
        >
          <ModalsProvider>
            {!props.navigation && <NavigationProgress size={5} />}

            <Notifications />

            {props.children}
          </ModalsProvider>
        </MantineProvider>
      </CobaltProvider>
    </>
  )
}
