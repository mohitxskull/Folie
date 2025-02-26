import { Logo } from "@/components/logo";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { removeCookie, setCookie } from "@/lib/cookie";
import { Button, Card, Center, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { env } from "@/configs/env";
import { setting } from "@/configs/setting";
import { NextServerError } from "@folie/cobalt/helpers";
import { InferGetServerSidePropsType } from "next";

export const getServerSideProps = cobaltServer.server(
  async ({ ctx }) => {
    const { query } = ctx;

    const token = query.token;

    if (typeof token !== "string") {
      throw new NextServerError({
        type: "404",
      });
    }

    if (token.length < 10 || token.length > 500) {
      throw new NextServerError({
        type: "404",
      });
    }

    return {
      props: {
        token,
      },
    };
  },
  {
    secure: ({ session }) => {
      return {
        allow: !session,
        redirect: "/vault",
      };
    },
  },
);

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const router = useRouter();

  const captchaRef = useRef<TurnstileInstance>(undefined);

  const [captchaReady, setCaptchaReady] = useState(false);

  const [verifyM, submit] = cobalt.useMutation({
    endpoint: "V1_AUTH_VERIFY",
    onSuccess: (data) => {
      notifications.show({
        message: data.message,
      });

      router.replace("/sign-in");
    },
    onErr: () => {
      captchaRef.current?.reset();
      setCaptchaReady(false);
      removeCookie("CAPTCHA");
    },
  });

  return (
    <>
      <Center mih="100vh" bg={setting.bg}>
        <Stack gap="xs">
          <Logo size="xl" mx="auto" />

          <Card withBorder p="md" w={450}>
            <Stack>
              <Title order={2}>Verify</Title>

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
                loading={verifyM.isPending}
                disabled={!captchaReady}
                onClick={() => {
                  submit({
                    token: props.token,
                  });
                }}
              >
                Verify
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Center>
    </>
  );
}
