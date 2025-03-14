import { gateTan } from "@/configs/gate_tan";
import { HorizontalInput, RightGroup } from "@folie/cobalt/components";
import { Button, PasswordInput, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Form } from "@folie/gate-tan/components";

export const SettingPasswordUpdateForm = () => {
  const { form, inputProps, mutation } = gateTan.useForm({
    endpoint: "V1_AUTH_PASSWORD_UPDATE",
    initialValues: {
      newPassword: "",
      oldPassword: "",
    },
    onSuccess: (updatedData) => {
      notifications.show({
        message: updatedData.message,
      });

      return {
        input: {
          newPassword: "",
          oldPassword: "",
        },
        queryKeys: (qk) => [qk("V1_AUTH_SESSION")],
      };
    },
  });

  return (
    <>
      <Form mutation={mutation} submit={mutation.mutate} form={form}>
        {({ dirty, loading }) => (
          <>
            <HorizontalInput
              label="Password"
              description="Please enter your current and new password to update your credentials."
            >
              <Stack>
                <PasswordInput
                  placeholder="Old password"
                  required
                  withAsterisk={false}
                  minLength={8}
                  maxLength={32}
                  {...inputProps("oldPassword")}
                  key={form.key("oldPassword")}
                />

                <PasswordInput
                  placeholder="New password"
                  required
                  withAsterisk={false}
                  minLength={8}
                  maxLength={32}
                  {...inputProps("newPassword")}
                  key={form.key("newPassword")}
                />
              </Stack>
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
