import { cobalt } from "@/configs/cobalt";
import { Form, RightGroup } from "@folie/cobalt/components";
import { Button, PasswordInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export const ProfilePasswordUpdateForm = () => {
  const [form, iProps, iKey, [mutation, submit]] = cobalt.useForm({
    endpoint: "V1_AUTH_PASSWORD_UPDATE",
    form: {
      values: {
        newPassword: "",
        oldPassword: "",
      },
    },
    onSuccess: () => {
      notifications.show({
        message: "Your Password has been updated",
      });

      return {
        input: {
          newPassword: "",
          oldPassword: "",
        },
        queryKeys: (qk) => [
          qk("V1_AUTH_SESSION", undefined),
          qk("V1_AUTH_PROFILE_SHOW", undefined),
        ],
      };
    },
  });

  return (
    <>
      <Form mutation={mutation} submit={submit} form={form}>
        {({ dirty, loading }) => (
          <>
            <PasswordInput
              label="Old Password"
              placeholder="Type your old password"
              required
              withAsterisk={false}
              {...iProps(["oldPassword"])}
              key={iKey(["oldPassword"])}
            />

            <PasswordInput
              label="New Password"
              placeholder="Type your new password"
              required
              withAsterisk={false}
              {...iProps(["newPassword"])}
              key={iKey(["newPassword"])}
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
