import { Logo } from "@/components/logo";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { removeCookie, setCookie } from "@/lib/cookie";
import { Form } from "@folie/cobalt/components";
import {
  Anchor,
  Box,
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
import { setting } from "@/configs/setting";

export const getServerSideProps = cobaltServer.secure({
  checkpoint: ({ session }) => {
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

  const [form, inputProps, inputKey, [mutation, submit]] = cobalt.useForm({
    endpoint: "V1_AUTH_SIGN_IN",
    form: {
      values: {
        email: "",
        password: "",
      },
    },
    onSuccess: (data) => {
      setCookie("SESSION", data.token);

      cobalt.query.clear();

      notifications.show({
        message: data.message,
      });

      router.replace("/app");
    },
    mutation: {
      onErr: () => {
        captchaRef.current?.reset();
        setCaptchaReady(false);
        removeCookie("CAPTCHA");
      },
    },
  });

  return (
    <>
      <Box bg={setting.bg}>
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

                <Form mutation={mutation} submit={submit} form={form}>
                  {({ dirty, loading }) => (
                    <>
                      <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        {...inputProps(["email"])}
                        key={inputKey(["email"])}
                        required
                        withAsterisk={false}
                      />

                      <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        {...inputProps(["password"])}
                        key={inputKey(["password"])}
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
                            setCookie("CAPTCHA", t);
                            setCaptchaReady(true);
                          }}
                          onExpire={() => {
                            notifications.show({
                              title: "Captcha Expired",
                              message: "Complete it again",
                            });

                            setCaptchaReady(false);
                            removeCookie("CAPTCHA");
                          }}
                          onError={() => {
                            notifications.show({
                              title: "Captcha Error",
                              message: "Please try again",
                            });

                            setCaptchaReady(false);
                            removeCookie("CAPTCHA");
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
      </Box>
    </>
  );
}
