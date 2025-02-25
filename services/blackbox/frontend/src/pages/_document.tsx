import { CobaltConfig } from "@/configs";
import { HeadScript } from "@folie/cobalt/components";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <HeadScript {...CobaltConfig} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
