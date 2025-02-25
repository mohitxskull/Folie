import {
  Collapse,
  Divider,
  Grid,
  InputDescription,
  InputLabel,
  Stack,
} from "@mantine/core";

type Props<T> = {
  label: string;
  description: string;
  children: React.ReactNode;
  expand?: {
    active: boolean;
    children: React.ReactNode;
  };
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
};

export const HorizontalInput = <T,>(props: Props<T>) => {
  return (
    <Stack>
      <Grid>
        <Grid.Col span={8}>
          <Stack gap={0}>
            <InputLabel>{props.label}</InputLabel>
            <InputDescription>{props.description}</InputDescription>
          </Stack>
        </Grid.Col>
        <Grid.Col span="auto">
          <Stack h="100%" justify="center" align="end" w="100%">
            {props.children}
          </Stack>
        </Grid.Col>
      </Grid>

      {props.expand && (
        <Collapse in={props.expand?.active === true}>
          {props.expand?.children}
        </Collapse>
      )}

      <Divider />
    </Stack>
  );
};
