import "@mantine/core/styles.css";
import "mantine-datatable/styles.css";
import "mantine-contextmenu/styles.css";
import "@/styles/global.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@folie/cobalt-animation/cobalt-animation.css";
import "@folie/cobalt/cobalt.css";

import type { AppProps } from "next/app";

import { CobaltConfig } from "@/configs";
import { MantineTheme } from "@/configs/theme";
import { CobaltContext, CobaltAPIContext } from "@folie/cobalt";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { cobalt } from "@/configs/cobalt";
import { useState } from "react";
import { useTimeout } from "@mantine/hooks";
import { NavigationLoading } from "@/components/navigation_loading";
import { ContextMenuProvider } from "mantine-contextmenu";

export default function App({
  Component,
  pageProps,
  router: serverRouter,
}: AppProps) {
  const router = useRouter();

  const [NavigationState, setNavigationState] = useState(
    serverRouter.pathname !== "/",
  );

  useTimeout(
    () => {
      setNavigationState(false);
    },
    1500,
    {
      autoInvoke: true,
    },
  );

  return (
    <>
      <NextSeo title="Formation" description="Headless Form API" />
      <CobaltContext
        cobalt={cobalt}
        config={CobaltConfig}
        mantine={MantineTheme}
        router={router}
        navigation={{
          started: (url) => {
            if (url !== router.asPath) {
              setNavigationState(true);
            }
          },
          completed: () => {
            setNavigationState(false);
          },
        }}
      >
        <CobaltAPIContext>
          <NavigationLoading opened={NavigationState}>
            <ContextMenuProvider>
              <Component {...pageProps} />
            </ContextMenuProvider>
          </NavigationLoading>
        </CobaltAPIContext>
      </CobaltContext>
    </>
  );
}
