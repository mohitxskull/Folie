import { Button, ButtonProps } from '@mantine/core'
import Link from 'next/link.js'

export type LogoBaseProps = ButtonProps & {
  href?: string
}

export const LogoBase = (props: LogoBaseProps) => {
  const { href, children, ...restProps } = props

  return (
    <>
      <Button
        size="compact-md"
        w="fit-content"
        p="0"
        variant="transparent"
        component={Link}
        href={href ?? '/'}
        {...restProps}
      >
        {children}
      </Button>
    </>
  )
}
