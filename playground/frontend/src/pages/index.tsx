import { Logo } from "@/components/logo";
import { setting } from "@/configs/setting";
import { Reveal } from "@folie/cobalt-animation";
import {
  AppShell,
  Button,
  Center,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <AppShell header={{ height: setting.header.height }} padding="md">
        <AppShell.Header withBorder={false} px="md" bg="transparent">
          <Group justify="space-between" h="100%">
            <Logo size="lg" />

            <Group>
              <Button component={Link} href="/sign-in" variant="outline">
                Sign In
              </Button>
              <Button component={Link} href="/sign-up">
                Sign Up
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main
          h={`calc(100vh - ${setting.header.height}px)`}
          bg={setting.bg}
        >
          <Center h="100%">
            <Stack gap="0">
              <Title mx="auto" size="15vw">
                <Reveal
                  splitBy="characters"
                  staggerDuration={0.025}
                  staggerFrom="center"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 21,
                  }}
                >
                  {setting.app.name}
                </Reveal>
              </Title>

              <Text mx="auto" size="lg">
                <Reveal
                  splitBy="characters"
                  staggerDuration={0.025}
                  staggerFrom="center"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 21,
                    delay: 0.3,
                  }}
                >
                  {setting.app.tagline}
                </Reveal>
              </Text>
            </Stack>
          </Center>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
