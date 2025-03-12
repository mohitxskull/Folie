import { gateClient } from "@/configs/gate_client";
import { gateTan } from "@/configs/gate_tan";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

export const useSignOut = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const mutation = gateTan.useMutation({
    endpoint: "V1_AUTH_SESSION",
    onSuccess: () => {
      gateClient.removeCookie("session");

      queryClient.clear();

      notifications.show({
        message: "You have successfully logged out!",
      });

      router.replace("/");
    },
  });

  return mutation;
};
