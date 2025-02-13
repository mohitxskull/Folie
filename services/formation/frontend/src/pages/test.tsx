import { FormEditor } from "@/components/field_editor";
import { FieldSchema } from "@folie/service-formation-backend/types";
import { Box, JsonInput, SimpleGrid } from "@mantine/core";
import { useListState } from "@mantine/hooks";

export default function Page() {
  const [fields, fieldHandlers] = useListState<FieldSchema>([
    {
      key: "email",
      name: "Email",
      type: "string",
      sub: {
        type: "none",
      },
    },
  ]);

  return (
    <>
      <Box p="xl">
        <SimpleGrid cols={2}>
          <FormEditor fields={fields} fieldHandler={fieldHandlers} />

          <JsonInput
            h="100%"
            value={JSON.stringify(fields, null, 2)}
            readOnly
            autosize
          />
        </SimpleGrid>
      </Box>
    </>
  );
}
