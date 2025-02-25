import { CobaltServer } from "@folie/cobalt";
import { api } from "./api";
import { routes } from "./routes";
import { COOKIE_KEY } from "@/lib/cookie";
import { CobaltKeys } from ".";

export const cobaltServer = new CobaltServer<
  typeof routes,
  "V1_AUTH_SESSION",
  CobaltKeys
>({
  api,
  routes,
  secure: {
    redirect: "/sign-in",
  },
  session: {
    cookie: COOKIE_KEY.SESSION,
    endpoint: "V1_AUTH_SESSION",
  },
});
