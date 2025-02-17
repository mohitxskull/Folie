import { Container, ContainerProps, Stack, StackProps } from '@mantine/core'

type Props = ContainerProps & {
  props?: {
    stack?: StackProps
  }
}

export const PageContainer = (props: Props) => {
  const { children, props: internalProps, ...restProps } = props

  return (
    <>
      <Container size="xl" w="100%" h="100%" mt="xl" {...restProps}>
        <Stack h="100%" {...internalProps?.stack}>
          {children}
        </Stack>
      </Container>
    </>
  )
}
