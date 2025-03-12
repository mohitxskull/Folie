import { gateTan } from "@/configs/gate_tan";

export const useSession = () => {
  const query = gateTan.useQuery({
    endpoint: "V1_AUTH_SESSION",
    input: undefined,
  });

  return query;
};
