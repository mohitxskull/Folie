import { gateTan } from "@/configs/gate_tan";
import {
  ProtectedBase,
  ProtectedChildrenProps,
} from "@folie/gate-tan/components";

export const Protected = (props: ProtectedChildrenProps) => (
  <>
    <ProtectedBase
      gateTan={gateTan}
      endpoint="V1_AUTH_SESSION"
      redirect={props.redirect || "/sign-in"}
    >
      {props.children}
    </ProtectedBase>
  </>
);
