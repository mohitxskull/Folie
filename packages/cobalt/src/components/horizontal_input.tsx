import {
  Collapse,
  Divider,
  Grid,
  GridProps,
  InputDescription,
  InputLabel,
  MantineSpacing,
  Stack,
  StackProps,
} from '@mantine/core'

type Props<T> = {
  label: string
  description: string
  children: React.ReactNode
  expand?: {
    active: boolean
    children: React.ReactNode
  }
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  rightAlign?: boolean
  gutter?: MantineSpacing
  props?: {
    root?: StackProps
    grid?: GridProps
  }
}

export const HorizontalInput = <T,>(props: Props<T>) => {
  return (
    <Stack w="100%" {...props.props?.root}>
      <Grid columns={12} gutter={{ base: 'xs', md: props.gutter ?? 100 }} {...props.props?.grid}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap={0}>
            <InputLabel>{props.label}</InputLabel>
            <InputDescription>{props.description}</InputDescription>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 'auto' }}>
          <Stack h="100%" justify="center" align={props.rightAlign ? 'end' : undefined} w="100%">
            {props.children}
          </Stack>
        </Grid.Col>
      </Grid>

      {props.expand && (
        <Collapse in={props.expand?.active === true}>{props.expand?.children}</Collapse>
      )}

      <Divider />
    </Stack>
  )
}
