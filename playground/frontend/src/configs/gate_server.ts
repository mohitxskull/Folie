import { gate } from "./gate";
import { endpoints } from "./endpoints";
import { GateNextServer } from "@folie/gate-next";
import { gateClient } from "./gate_client";

export const gateServer = new GateNextServer({
  gate,
  endpoints,
  checkpoint: {
    redirect: "/sign-in",
  },
  session: {
    cookie: gateClient.cookieKeys.session,
    endpoint: "V1_AUTH_SESSION",
  },
});
