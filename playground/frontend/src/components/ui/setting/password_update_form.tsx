import { cobalt } from "@/configs/cobalt";
import { Form, HorizontalInput, RightGroup } from "@folie/cobalt/components";
import { Button, PasswordInput, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export const SettingPasswordUpdateForm = () => {
  const [form, iProps, iKey, [mutation, submit]] = cobalt.useForm({
    endpoint: "V1_AUTH_PASSWORD_UPDATE",
    form: {
      values: {
        newPassword: "",
        oldPassword: "",
      },
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
        queryKeys: (qk) => [qk("V1_AUTH_SESSION", undefined)],
      };
    },
  });

  return (
    <>
      <Form mutation={mutation} submit={submit} form={form}>
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
                  {...iProps(["oldPassword"])}
                  key={iKey(["oldPassword"])}
                />

                <PasswordInput
                  placeholder="New password"
                  required
                  withAsterisk={false}
                  minLength={8}
                  maxLength={32}
                  {...iProps(["newPassword"])}
                  key={iKey(["newPassword"])}
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
