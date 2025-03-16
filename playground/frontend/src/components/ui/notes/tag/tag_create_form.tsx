import { gateTan } from "@/configs/gate_tan";
import { RightGroup } from "@folie/cobalt/components";
import { Form } from "@folie/gate-tan/components";
import { Button, Modal, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

type Props = {
  refetch: () => void;
  opened: boolean;
  close: () => void;
};

export const TagCreateForm = (props: Props) => {
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

      props.close();
      props.refetch();
      form.reset();
    },
  });

  return (
    <>
      <Modal
        centered
        title="Create New Tag"
        opened={props.opened}
        onClose={() => {
          form.reset();
          props.close();
        }}
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
      </Modal>
    </>
  );
};
