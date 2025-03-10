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
    endpoint: "V1_AUTH_SIGN_UP",
    form: {
      values: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
    },
    onSuccess: (data) => {
      cobalt.query.clear();

      notifications.show({
        message: data.message,
      });

      router.replace("/sign-in");
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
                <Title order={2}>Create an account</Title>

                <Text size="sm">
                  Already have an account?{" "}
                  <Anchor td="underline" href="/sign-in">
                    Sign In
                  </Anchor>
                </Text>

                <Form mutation={mutation} submit={submit} form={form}>
                  {({ dirty, loading }) => (
                    <>
                      <Group grow>
                        <TextInput
                          label="First name"
                          placeholder="John"
                          {...inputProps(["firstName"])}
                          key={inputKey(["firstName"])}
                          required
                          withAsterisk={false}
                        />

                        <TextInput
                          label="Last name"
                          placeholder="Doe"
                          {...inputProps(["lastName"])}
                          key={inputKey(["lastName"])}
                          required
                          withAsterisk={false}
                        />
                      </Group>

                      <TextInput
                        label="Email"
                        description="Only gmail's are allowed"
                        placeholder="someone@gmail.com"
                        type="email"
                        {...inputProps(["email"])}
                        key={inputKey(["email"])}
                        required
                        withAsterisk={false}
                      />

                      <PasswordInput
                        label="Password"
                        placeholder="MwL]6j*mGnQW9zn"
                        {...inputProps(["password"])}
                        key={inputKey(["password"])}
                        required
                        minLength={8}
                        maxLength={32}
                        withAsterisk={false}
                      />

                      <PasswordInput
                        label="Confirm Password"
                        placeholder="MwL]6j*mGnQW9zn"
                        {...inputProps(["confirmPassword"])}
                        key={inputKey(["confirmPassword"])}
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
                        Sign Up
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
