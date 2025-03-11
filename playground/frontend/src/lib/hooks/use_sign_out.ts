import { cobalt } from "@/configs/cobalt";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

export const useSignOut = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const mutation = cobalt.useMutation({
    endpoint: "V1_AUTH_SESSION",
    onSuccess: () => {
      cobalt.removeCookie("session");

      queryClient.clear();

      notifications.show({
        message: "You have successfully logged out!",
      });

      router.replace("/");
    },
  });

  return mutation;
};
