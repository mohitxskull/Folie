import { Logo } from "@/components/logo";
import {
  Anchor,
  Button,
  Card,
  Container,
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
import { useQueryClient } from "@tanstack/react-query";
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

  const queryClient = useQueryClient();

  const { form, inputProps, mutation } = gateTan.useForm({
    endpoint: "V1_AUTH_SIGN_IN",

    initialValues: {
      email: "",
      password: "",
    },

    onSuccess: (data) => {
      gateClient.setCookie("session", data.token);

      queryClient.clear();

      notifications.show({
        message: data.message,
      });

      router.replace("/app");
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
              <Title order={2}>Welcome back!</Title>

              <Text size="sm">
                Don&apos;t have an account?{" "}
                <Anchor td="underline" href="/sign-up">
                  Create an account
                </Anchor>
              </Text>

              <Form mutation={mutation} submit={mutation.mutate} form={form}>
                {({ dirty, loading }) => (
                  <>
                    <TextInput
                      autoComplete="email"
                      label="Email"
                      placeholder="Enter your email"
                      type="email"
                      {...inputProps("email")}
                      key={form.key("email")}
                      required
                      withAsterisk={false}
                    />

                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      {...inputProps("password")}
                      key={form.key("password")}
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
                      Sign In
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
