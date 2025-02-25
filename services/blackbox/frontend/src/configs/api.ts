import { Gate } from "@folie/gate";
import { getCookie } from "@/lib/cookie";
import { routes } from "./routes";
import { env } from "./env";

export const api = new Gate({
  base: new URL(env.NEXT_PUBLIC_BACKEND_URL),
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
  routes,
});
