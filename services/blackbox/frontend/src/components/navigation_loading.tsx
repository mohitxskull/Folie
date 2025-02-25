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
        center={
          <Title>
            <Breathing
              label="Formation"
              staggerDuration={0.1}
              fromFontVariationSettings="'wght' 100, 'slnt' 0"
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
