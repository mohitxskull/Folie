import { routes } from "./routes";
import { api } from "./api";
import { QueryClient } from "@tanstack/react-query";
import { Cobalt } from "@folie/cobalt";
import { notifications } from "@mantine/notifications";
import { CobaltKeys } from ".";

export const cobalt = new Cobalt<typeof routes, CobaltKeys>({
  api,
  routes,
  query: new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      mutations: {
        throwOnError: false,
      },
    },
  }),
  notification: (params) =>
    notifications.show({
      title: params.title,
      message: params.message,
    }),
});
