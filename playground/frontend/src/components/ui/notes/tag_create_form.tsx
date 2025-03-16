import { gateTan } from "@/configs/gate_tan";
import { RightGroup, TriggeredModal } from "@folie/cobalt/components";
import { Form } from "@folie/gate-tan/components";
import { Button, Text, Textarea, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

export const TagCreateForm = (props: {
  refetch: () => void;
  onOpen?: () => void;
  onClose?: () => void;
}) => {
  const [opened, { open, close }] = useDisclosure(false);

  const { form, mutation, inputProps } = gateTan.useForm({
    endpoint: "V1_TAG_CREATE",
    initialValues: {
      name: "",
      description: "",
    },
    onSuccess: (updatedData) => {
      notifications.show({
        message: updatedData.message,
      });

      close();
      props.refetch();
      form.reset();
    },
  });

  return (
    <>
      <TriggeredModal
        opened={opened}
        close={() => {
          form.reset();
          close();
          props.onClose?.();
        }}
        open={open}
        target={
          <>
            <Text
              size="sm"
              fw="500"
              c="white"
              style={{ cursor: "pointer" }}
              onClick={() => {
                props.onOpen?.();
                open();
              }}
            >
              Create New
            </Text>
          </>
        }
      >
        <>
          <Form mutation={mutation} form={form} submit={mutation.mutate}>
            {({ dirty, loading }) => (
              <>
                <TextInput
                  minLength={1}
                  maxLength={20}
                  label="Name"
                  placeholder="Office"
                  required
                  {...inputProps("name")}
                  key={form.key("name")}
                />

                <Textarea
                  minLength={1}
                  maxLength={100}
                  autosize
                  minRows={3}
                  label="Description"
                  placeholder="Description"
                  {...inputProps("description")}
                  key={form.key("description")}
                />

                <RightGroup>
                  <Button type="submit" loading={loading} disabled={!dirty}>
                    Create
                  </Button>
                </RightGroup>
              </>
            )}
          </Form>
        </>
      </TriggeredModal>
    </>
  );
};
