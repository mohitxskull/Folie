import { cobalt } from "@/configs/cobalt";

export const useSession = () => {
  const query = cobalt.useQuery({
    endpoint: "V1_AUTH_SESSION",
    input: {},
  });

  return query;
};
