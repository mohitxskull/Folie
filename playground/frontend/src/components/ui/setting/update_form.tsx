import { gateTan } from "@/configs/gate_tan";
import { HorizontalInput, RightGroup } from "@folie/cobalt/components";
import { Form } from "@folie/gate-tan/components";
import { V1AuthSessionRoute } from "@folie/playground-backend/blueprint";
import { Button, Group, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

type Props = {
  session: V1AuthSessionRoute["output"]["session"];
};

export const SettingGeneralUpdateForm = (props: Props) => {
  const [form, formM, iProps] = gateTan.useForm({
    endpoint: "V1_AUTH_PROFILE_UPDATE",
    initialValues: {
      firstName: props.session.firstName,
      lastName: props.session.lastName,
    },
    onSuccess: (updatedData) => {
      notifications.show({
        message: updatedData.message,
      });

      return {
        input: {
          ...updatedData.user,
        },
        queryKeys: (qk) => [qk("V1_AUTH_SESSION")],
      };
    },
  });

  return (
    <>
      <Form mutation={formM} submit={formM.mutate} form={form}>
        {({ dirty, loading }) => (
          <>
            <HorizontalInput
              label="Name"
              description="This name will be visible to users with whom you will share your passwords, notes etc."
            >
              <Group grow>
                <TextInput
                  placeholder="First Name"
                  {...iProps("firstName")}
                  key={form.key("firstName")}
                />

                <TextInput
                  placeholder="Last Name"
                  {...iProps("lastName")}
                  key={form.key("lastName")}
                />
              </Group>
            </HorizontalInput>

            <HorizontalInput
              label="Email"
              description="This is your primary email address."
            >
              <TextInput
                placeholder="someone@gmail.com"
                readOnly
                value={props.session.email}
              />
            </HorizontalInput>

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
