import { setting } from "@/configs/setting";
import { LogoBase, LogoBaseProps } from "@folie/cobalt/components";

export const Logo = (props: LogoBaseProps) => {
  return (
    <>
      <LogoBase {...props}>{setting.app.name}</LogoBase>
    </>
  );
};
