import { ICON_SIZE } from "@folie/cobalt";
import { FieldSchema } from "@folie/service-formation-backend/types";
import {
  ActionIcon,
  Button,
  InputDescription,
  InputLabel,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { setProperty, getProperty, deleteProperty } from "dot-prop";

export const ListOption = <T extends FieldSchema>(props: {
  label: string;
  description: string;
  path: string;
  value: T;
  onChange: (value: T) => void;
}) => (
  <>
    <Stack gap={1}>
      <Stack gap={0}>
        <InputLabel>{props.label}</InputLabel>
        <InputDescription mb={5}>{props.description}</InputDescription>
      </Stack>

      {(getProperty(props.value, props.path, []) || []).map((item, index) => (
        <>
          <TextInput
            mb="xs"
            value={item}
            onChange={(e) => {
              props.onChange(
                setProperty(
                  props.value,
                  `${props.path}[${index}]`,
                  e.target.value,
                ),
              );
            }}
            rightSection={
              <ActionIcon
                variant="transparent"
                onClick={() => {
                  const res = getProperty(
                    props.value,
                    props.path,
                    [],
                  ) as string[];

                  deleteProperty(res, `[${index}]`);

                  const resA = res.filter((item) => !item);

                  if (resA.length > 0) {
                    props.onChange(setProperty(props.value, props.path, resA));
                  } else {
                    const resB = props.value;

                    deleteProperty(resB, props.path);

                    const parentPath = props.path
                      .split(".")
                      .slice(0, -1)
                      .join(".");

                    const parentObj = getProperty(resB, parentPath, {});

                    if (Object.keys(parentObj || {}).length < 1) {
                      deleteProperty(resB, parentPath);
                    }

                    props.onChange(resB);
                  }
                }}
              >
                <IconTrash size={ICON_SIZE.XS} />
              </ActionIcon>
            }
          />
        </>
      ))}

      <Button
        variant="outline"
        onClick={() => {
          props.onChange(
            setProperty(props.value, `${props.path}`, [
              ...(getProperty(props.value, props.path, []) as string[]),
              "",
            ]),
          );
        }}
      >
        Add
      </Button>
    </Stack>
  </>
);
