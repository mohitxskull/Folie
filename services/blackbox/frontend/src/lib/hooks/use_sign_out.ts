import { cobalt } from "@/configs/cobalt";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { removeCookie } from "../cookie";

export const useSignOut = () => {
  const router = useRouter();

  const mutation = cobalt.useMutation({
    endpoint: "V1_AUTH_SESSION",
    onSuccess: () => {
      removeCookie("SESSION");

      cobalt.query.clear();

      notifications.show({
        message: "You have successfully logged out!",
      });

      router.replace("/");
    },
  });

  return mutation;
};
