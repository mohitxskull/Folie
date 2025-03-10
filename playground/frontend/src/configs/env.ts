import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_CAPTCHA_PUBLIC_KEY: z.string().min(1),

    NEXT_PUBLIC_BACKEND_URL: z
      .string()
      .min(1)
      .url()
      .optional()
      .default("http://localhost:3333"),

    NEXT_PUBLIC_NODE_ENV: z
      .enum(["development", "production"])
      .optional()
      .default("production"),
  },

  runtimeEnv: {
    NEXT_PUBLIC_CAPTCHA_PUBLIC_KEY: process.env.NEXT_PUBLIC_CAPTCHA_PUBLIC_KEY,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  },

  isServer: typeof window === "undefined",
  emptyStringAsUndefined: false,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
