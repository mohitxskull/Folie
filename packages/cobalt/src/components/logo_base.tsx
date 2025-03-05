import { Button, ButtonProps } from '@mantine/core'
import Link from 'next/link.js'

export type LogoBaseProps = ButtonProps & {
  href?: string
  onClick?: () => void
}

export const LogoBase = (props: LogoBaseProps) => {
  const { href, children, onClick, ...restProps } = props

  return (
    <>
      <Button
        size="compact-md"
        w="fit-content"
        p="0"
        variant="transparent"
        {...(onClick ? { onClick } : { renderRoot: (p) => <Link {...p} href={href ?? '/'} /> })}
        {...restProps}
      >
        {children}
      </Button>
    </>
  )
}
