import { ICON_SIZE } from '@folie/cobalt'
import { Button, Group, Stack, Text, Title, TitleOrder } from '@mantine/core'
import { IconArrowNarrowLeft } from '@tabler/icons-react'
import { useRouter } from 'next/router'

type Props = {
  title: string
  description?: string
  children?: React.ReactNode
  withBackBtn?: boolean
  order?: TitleOrder
}

export const PageHeader = (props: Props) => {
  const router = useRouter()

  return (
    <>
      <Stack gap="xs">
        {props.withBackBtn && (
          <Button
            size="compact-xs"
            variant="transparent"
            onClick={() => router.back()}
            w="fit-content"
            p={0}
            leftSection={<IconArrowNarrowLeft size={ICON_SIZE.SM} />}
          >
            Go Back
          </Button>
        )}

        <Group justify="space-between" align="start">
          <Stack gap="0">
            <Title order={props.order || 3}>{props.title}</Title>

            <Text c="dimmed" size="sm">
              {props.description}
            </Text>
          </Stack>

          {props.children}
        </Group>
      </Stack>
    </>
  )
}
