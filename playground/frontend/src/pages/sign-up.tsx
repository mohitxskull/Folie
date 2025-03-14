import { Logo } from "@/components/logo";
import {
  Anchor,
  Button,
  Card,
  Container,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { env } from "@/configs/env";
import { gateServer } from "@/configs/gate_server";
import { gateTan } from "@/configs/gate_tan";
import { gateClient } from "@/configs/gate_client";
import { Form } from "@folie/gate-tan/components";

export const getServerSideProps = gateServer.checkpoint({
  condition: ({ session }) => {
    return {
      allow: !session,
      redirect: "/app",
    };
  },
});

export default function Page() {
  const router = useRouter();

  const captchaRef = useRef<TurnstileInstance>(undefined);

  const [captchaReady, setCaptchaReady] = useState(false);

  const { form, inputProps, mutation } = gateTan.useForm({
    endpoint: "V1_AUTH_SIGN_UP",

    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    onSuccess: (data) => {
      notifications.show({
        message: data.message,
      });

      router.replace("/sign-in");
    },
    mutation: {
      onErrorHook: {
        after: () => {
          captchaRef.current?.reset();
          setCaptchaReady(false);
          gateClient.removeCookie("captcha");
        },
      },
    },
  });

  return (
    <>
      <Container size="xs">
        <Stack gap="xs" w="100%" justify="center" h="100vh">
          <Logo size="xl" mx="auto" />

          <Card withBorder p="md">
            <Stack>
              <Title order={2}>Create an account</Title>

              <Text size="sm">
                Already have an account?{" "}
                <Anchor td="underline" href="/sign-in">
                  Sign In
                </Anchor>
              </Text>

              <Form mutation={mutation} submit={mutation.mutate} form={form}>
                {({ dirty, loading }) => (
                  <>
                    <Group grow>
                      <TextInput
                        label="First name"
                        placeholder="John"
                        {...inputProps("firstName")}
                        key={form.key("firstName")}
                        required
                        withAsterisk={false}
                      />

                      <TextInput
                        label="Last name"
                        placeholder="Doe"
                        {...inputProps("lastName")}
                        key={form.key("lastName")}
                        required
                        withAsterisk={false}
                      />
                    </Group>

                    <TextInput
                      label="Email"
                      description="Only gmail's are allowed"
                      placeholder="someone@gmail.com"
                      type="email"
                      {...inputProps("email")}
                      key={form.key("email")}
                      required
                      withAsterisk={false}
                    />

                    <PasswordInput
                      label="Password"
                      placeholder="MwL]6j*mGnQW9zn"
                      {...inputProps("password")}
                      key={form.key("password")}
                      required
                      minLength={8}
                      maxLength={32}
                      withAsterisk={false}
                    />

                    <PasswordInput
                      label="Confirm Password"
                      placeholder="MwL]6j*mGnQW9zn"
                      {...inputProps("confirmPassword")}
                      key={form.key("confirmPassword")}
                      required
                      minLength={8}
                      maxLength={32}
                      withAsterisk={false}
                    />

                    {dirty && (
                      <Turnstile
                        ref={captchaRef}
                        siteKey={env.NEXT_PUBLIC_CAPTCHA_PUBLIC_KEY}
                        onSuccess={(t) => {
                          gateClient.setCookie("captcha", t);
                          setCaptchaReady(true);
                        }}
                        onExpire={() => {
                          notifications.show({
                            title: "Captcha Expired",
                            message: "Complete it again",
                          });

                          setCaptchaReady(false);
                          gateClient.removeCookie("captcha");
                        }}
                        onError={() => {
                          notifications.show({
                            title: "Captcha Error",
                            message: "Please try again",
                          });

                          setCaptchaReady(false);
                          gateClient.removeCookie("captcha");
                        }}
                        options={{
                          size: "flexible",
                        }}
                      />
                    )}

                    <Button
                      type="submit"
                      loading={loading}
                      disabled={!dirty || !captchaReady}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </Form>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
