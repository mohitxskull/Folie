import { Logo } from "@/components/logo";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { removeCookie, setCookie } from "@/lib/cookie";
import { Form } from "@folie/cobalt/components";
import {
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
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
      <Center mih="100vh" bg={setting.bg}>
        <Stack gap="xs">
          <Logo size="xl" mx="auto" />

          <Card withBorder p="md" w={450}>
            <Stack>
              <Title order={2}>Sign In</Title>

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
                      withAsterisk={false}
                    />

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
      </Center>
    </>
  );
}
