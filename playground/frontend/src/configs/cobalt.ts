import { gate } from "./gate";
import { Cobalt } from "@folie/cobalt";
import { notifications } from "@mantine/notifications";
import { endpoints } from "./endpoints";

export const cobalt = new Cobalt({
  gate,
  endpoints,
  cookieKeys: {
    session: "session_token",
    captcha: "captcha_token",
  },
  paramKeys: [],
  notification: (params) =>
    notifications.show({
      title: params.title,
      message: params.message,
    }),
});