import { GateTan } from '@folie/gate-tan'
import { ApiEndpoints } from '@folie/lib'
import { useRouter } from 'next/router.js'

type Props<Endpoints extends ApiEndpoints, EK extends keyof Endpoints> = {
  children: React.ReactNode
  redirect: string
  gateTan: GateTan<Endpoints>
  endpoint: EK
  loading?: React.ReactNode
}

export type ProtectedChildrenProps = {
  children: React.ReactNode
  redirect?: string
}

export const ProtectedBase = <const Endpoints extends ApiEndpoints, EK extends keyof Endpoints>(
  props: Props<Endpoints, EK>
) => {
  const sessionQ = props.gateTan.useQuery({
    endpoint: props.endpoint,
    input: undefined,
  })

  const router = useRouter()

  if (sessionQ.isLoading) {
    return props.loading ?? 'Loading...'
  }

  if (sessionQ.isError) {
    router.push(props.redirect)
  }

  if (!sessionQ.data) {
    router.push(props.redirect)
  }

  return <>{props.children}</>
}
