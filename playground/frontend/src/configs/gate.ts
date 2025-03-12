import { Gate } from "@folie/gate";
import { env } from "./env";
import { endpoints } from "./endpoints";
import { gateClient } from "./gate_client";

export const gate = new Gate({
  baseURL: new URL(env.NEXT_PUBLIC_BACKEND_URL),
  endpoints: endpoints,
  token: () => gateClient.getCookie("session"),
  header: () => {
    const cap = gateClient.getCookie("captcha");

    if (!cap) {
      return null;
    }

    return {
      token: cap,
    };
  },
});
