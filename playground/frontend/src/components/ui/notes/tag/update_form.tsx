import { gateTan } from "@/configs/gate_tan";
import { RightGroup } from "@folie/cobalt/components";
import { Form } from "@folie/gate-tan/components";
import { V1TagShowRoute } from "@folie/playground-backend/blueprint";
import { Button, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

type Props = {
  tag: V1TagShowRoute["output"]["tag"];
};

export const TagUpdateForm = (props: Props) => {
  const { form, mutation, inputProps } = gateTan.useForm({
    endpoint: "V1_TAG_UPDATE",
    initialValues: {
      params: {
        tagId: props.tag.id,
      },
      name: props.tag.name,
      description: props.tag.description,
    },
    onSuccess: (updatedData) => {
      notifications.show({
        message: updatedData.message,
      });

      return {
        queryKeys: (qk) => [
          qk("V1_TAG_SHOW", {
            params: {
              tagId: props.tag.id,
            },
          }),
        ],

        input: {
          params: {
            tagId: props.tag.id,
          },
          description: updatedData.tag.description,
          name: updatedData.tag.name,
        },
      };
    },
  });

  return (
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
                Update
              </Button>
            </RightGroup>
          </>
        )}
      </Form>
    </>
  );
};
