import {
  ActionIcon,
  AppShellSection,
  CloseButton,
  Group,
  Text,
  Title,
} from "@mantine/core";

type Props = {
  state: boolean;
  setState: (value: boolean) => void;
};

export const TagManageAside = (props: Props) => {
  return (
    <>
      <AppShellSection>
        <Group justify="space-between">
          <CloseButton
            variant="transparent"
            onClick={() => props.setState(!props.state)}
          />

          <Title c="white" order={5} fw="600">
            Manage Tags
          </Title>
        </Group>
      </AppShellSection>
      <AppShellSection grow my="md">
        <Text>Goat</Text>
      </AppShellSection>
    </>
  );
};
