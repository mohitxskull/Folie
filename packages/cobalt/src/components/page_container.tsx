import { Container, ContainerProps, Stack } from '@mantine/core'

type Props = ContainerProps

export const PageContainer = (props: Props) => {
  const { children, ...restProps } = props

  return (
    <>
      <Container size="xl" w="100%" h="100%" mt="xl" {...restProps}>
        <Stack h="100%">{children}</Stack>
      </Container>
    </>
  )
}
