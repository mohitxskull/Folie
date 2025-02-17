import { ICON_SIZE } from "@folie/cobalt";
import { FieldSchema } from "@folie/service-formation-backend/types";
import {
  ActionIcon,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { deleteProperty, getProperty, setProperty } from "dot-prop";

export const BaseField = <T extends FieldSchema>(props: {
  fields: T[];
  field: T;
  index: number;
  remove: (index: number) => void;
  onChange: (f: T) => void;
  children: React.ReactNode;
}) => {
  const { field, fields, index, onChange, remove } = props;

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Text>{field.name || "Give this field a name"}</Text>
          <ActionIcon
            variant="transparent"
            bg="transparent"
            c={fields.length < 2 ? undefined : "red"}
            disabled={fields.length < 2}
            onClick={() => remove(index)}
          >
            <IconTrash size={ICON_SIZE.XS} />
          </ActionIcon>
        </Group>

        <SimpleGrid cols={2}>
          <TextInput
            label="Name"
            placeholder="First Name"
            value={field.name}
            onChange={(e) =>
              onChange(setProperty(field, "name", e.target.value))
            }
          />

          <Select
            label="Type"
            data={[
              {
                label: "String",
                value: "string",
              },
              {
                label: "Number",
                value: "number",
              },
            ]}
            value={field.type}
            onChange={(e) => {
              let res = {
                key: field.key,
                name: field.name,
                type: e ?? "string",
              } as T;

              if (res.type === "string" && !res.sub) {
                res = setProperty(res, "sub", {
                  type: "none",
                });
              }

              onChange(res);
            }}
          />
        </SimpleGrid>

        {field.type === "string" && (
          <>
            <Select
              label="Sub Type"
              data={[
                {
                  label: "None",
                  value: "none",
                },
                {
                  label: "Email",
                  value: "email",
                },
                {
                  label: "URL",
                  value: "url",
                },
              ]}
              value={getProperty(field, "sub.type", "none")}
              onChange={(e) => {
                const res = setProperty(field, "sub.type", e ?? "none");

                if (getProperty(res, "sub.type") === "none") {
                  deleteProperty(res, "sub.options");
                }

                onChange(res);
              }}
            />
          </>
        )}

        {props.children}
      </Stack>
    </>
  );
};
