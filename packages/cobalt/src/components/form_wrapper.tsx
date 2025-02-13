import { Grid } from '@mantine/core'

type Props = {
  children: React.ReactNode
  rightSection?: React.ReactNode
}

export const FormWrapper = (props: Props) => (
  <>
    <Grid columns={10}>
      <Grid.Col span={{ base: 10, md: 5, lg: 4 }}>{props.children}</Grid.Col>
      <Grid.Col span="auto">{props.rightSection}</Grid.Col>
    </Grid>
  </>
)
