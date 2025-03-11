import { CobaltServer } from "@folie/cobalt";
import { gate } from "./gate";
import { endpoints } from "./endpoints";
import { cobalt } from "./cobalt";

export const cobaltServer = new CobaltServer({
  gate,
  endpoints,
  secure: {
    redirect: "/sign-in",
  },
  session: {
    cookie: cobalt.cookieKeys.session,
    endpoint: "V1_AUTH_SESSION"
  },
});
