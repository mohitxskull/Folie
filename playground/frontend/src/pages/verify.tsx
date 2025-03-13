import { Logo } from "@/components/logo";
import { Button, Card, Container, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { env } from "@/configs/env";
import { InferGetServerSidePropsType } from "next";
import { gateServer } from "@/configs/gate_server";
import { NextServerError } from "@folie/gate-next";
import { gateTan } from "@/configs/gate_tan";
import { gateClient } from "@/configs/gate_client";

export const getServerSideProps = gateServer.server(
  async ({ ctx }) => {
    const { query } = ctx;

    const token = query.token;

    if (typeof token !== "string") {
      throw NextServerError.notFound();
    }

    const tokenLength = token.length;

    if (tokenLength < 150 || tokenLength > 300) {
      throw NextServerError.notFound();
    }

    return {
      props: {
        token,
      },
    };
  },
  {
    checkpoint: ({ session }) => {
      return {
        allow: !session,
        redirect: "/app",
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

  const verifyM = gateTan.useMutation({
    endpoint: "V1_AUTH_VERIFY",
    onSuccess: (data) => {
      notifications.show({
        message: data.message,
      });

      router.replace("/sign-in");
    },

    onErrorHook: {
      after: () => {
        captchaRef.current?.reset();
        setCaptchaReady(false);
        gateClient.removeCookie("captcha");
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
              <Title order={2}>Verify Your Identity</Title>

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

              <Button
                loading={verifyM.isPending}
                disabled={!captchaReady}
                onClick={() => {
                  verifyM.mutate({
                    token: props.token,
                  });
                }}
              >
                Verify
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
