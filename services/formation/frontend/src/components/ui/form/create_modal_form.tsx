import { cobalt } from "@/configs/cobalt";
import { Form, RightGroup, TriggeredModal } from "@folie/cobalt/components";
import { Button, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

export const FormCreateModalForm = (props: { refetch: () => void }) => {
  const [opened, { open, close }] = useDisclosure(false);

  const [form, iProps, iKey, [mutation, submit]] = cobalt.useFormP({
    endpoint: "V1_FORM_CREATE",
    form: {
      values: {
        name: "",
      },
    },
    onSuccess: () => {
      notifications.show({
        message: "Form has been created!",
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
          close();
          form.reset();
        }}
        open={open}
        target={
          <>
            <Button onClick={open}>Create</Button>
          </>
        }
      >
        <>
          <Form mutation={mutation} form={form} submit={submit}>
            {({ dirty, loading }) => (
              <>
                <TextInput
                  label="Name"
                  placeholder="Quantum"
                  {...iProps(["name"])}
                  key={iKey(["name"])}
                  required
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
