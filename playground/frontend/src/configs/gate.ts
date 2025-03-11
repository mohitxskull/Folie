import { Gate } from "@folie/gate";
import { getCookie } from "@/lib/cookie";
import { env } from "./env";
import { endpoints } from "./endpoints";

export const gate = new Gate({
  baseURL: new URL(env.NEXT_PUBLIC_BACKEND_URL),
  endpoints: endpoints,
  token: () => getCookie("SESSION"),
  header: () => {
    const cap = getCookie("CAPTCHA");

    if (!cap) {
      return null;
    }

    return {
      token: cap,
    };
  },
});
