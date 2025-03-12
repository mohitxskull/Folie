import { gate } from "./gate";
import { notifications } from "@mantine/notifications";
import { endpoints } from "./endpoints";
import { GateTan } from "@folie/gate-tan";

export const gateTan = new GateTan({
  gate,
  endpoints,
  notification: (params) =>
    notifications.show({
      title: params.title,
      message: params.message,
    }),
});
