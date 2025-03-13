import { setting } from "@/configs/setting";
import { Breathing } from "@folie/cobalt-animation";
import { NavigationLoadingBase } from "@folie/cobalt/components";
import { Title } from "@mantine/core";

type Props = {
  opened: boolean;
  children: React.ReactNode;
};

export const NavigationLoading = (props: Props) => {
  return (
    <>
      <NavigationLoadingBase
        opened={props.opened}
        bg="var(--mantine-color-dark-9)"
        center={
          <Title>
            <Breathing
              label={setting.app.name}
              staggerDuration={0.1}
              fromFontVariationSettings="'wght' 200, 'slnt' 0"
              toFontVariationSettings="'wght' 800, 'slnt' -10"
            />
          </Title>
        }
      >
        {props.children}
      </NavigationLoadingBase>
    </>
  );
};
