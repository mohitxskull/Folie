import "@mantine/core/styles.css";
import "@/styles/global.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/tiptap/styles.css";
import "@folie/cobalt-animation/cobalt-animation.css";
import "@folie/cobalt/cobalt.css";
import "@/styles/theme.css";

import type { AppProps } from "next/app";

import { CobaltConfig } from "@/configs";
import { MantineTheme } from "@/configs/theme";
import { CobaltContext } from "@folie/cobalt";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useState } from "react";
import { setting } from "@/configs/setting";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <NextSeo title={setting.app.name} description={setting.app.description} />
      <CobaltContext
        config={CobaltConfig}
        mantine={MantineTheme}
        router={router}
        // navigation={{
        //   started: (url) => {
        //     if (url !== router.asPath) {
        //       setNavigationState(true);
        //     }
        //   },
        //   completed: () => {
        //     setNavigationState(false);
        //   },
        // }}
      >
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
          {/* <NavigationLoading opened={NavigationState}>
          </NavigationLoading> */}
        </QueryClientProvider>
      </CobaltContext>
    </>
  );
}
