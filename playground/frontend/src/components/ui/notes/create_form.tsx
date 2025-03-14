import { gateTan } from "@/configs/gate_tan";
import { ICON_SIZE } from "@folie/cobalt";
import { RightGroup, TriggeredModal } from "@folie/cobalt/components";
import { Form } from "@folie/gate-tan/components";
import { Button, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";

export const NoteCreateForm = (props: { refetch: () => void }) => {
  const [opened, { open, close }] = useDisclosure(false);

  const { form, mutation, inputProps } = gateTan.useForm({
    endpoint: "V1_NOTE_CREATE",
    initialValues: {
      title: "",
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
        }}
        open={open}
        target={
          <>
            <Button
              // c="dark"
              leftSection={<IconPlus size={ICON_SIZE.SM} />}
              onClick={open}
            >
              Create
            </Button>
          </>
        }
      >
        <>
          <Form mutation={mutation} form={form} submit={mutation.mutate}>
            {({ dirty, loading }) => (
              <>
                <TextInput
                  minLength={1}
                  maxLength={100}
                  label="Title"
                  placeholder="Flower Class Notes"
                  required
                  {...inputProps("title")}
                  key={form.key("title")}
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
