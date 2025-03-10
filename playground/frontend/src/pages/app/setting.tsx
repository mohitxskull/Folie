import { AppLayout } from "@/components/layout/app";
import { LocalQueryLoader } from "@/components/query_loader";
import { cobaltServer } from "@/configs/cobalt_server";
import { useSession } from "@/lib/hooks/use_session";
import BoringAvatar from "boring-avatars";
import {
  Avatar,
  Center,
  Container,
  Group,
  Loader,
  Space,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { SettingGeneralUpdateForm } from "@/components/ui/setting/update_form";
import { SettingPasswordUpdateForm } from "@/components/ui/setting/password_update_form";

export const getServerSideProps = cobaltServer.secure();

export default function Page() {
  const sessionQ = useSession();

  return (
    <>
      <AppLayout fullHeight>
        <LocalQueryLoader
          query={sessionQ}
          isLoading={
            <>
              <Center h="100vh">
                <Loader />
              </Center>
            </>
          }
        >
          {({ session }) => (
            <>
              <Container pt="xl">
                <Stack>
                  <Group>
                    <Avatar size="xl" radius="md">
                      <BoringAvatar
                        name={session.id}
                        square
                        variant="beam"
                        colors={["#141414", "#c9c9c9"]}
                      />
                    </Avatar>

                    <Stack gap={0}>
                      <Title order={3}>
                        {session.firstName} {session.lastName}
                      </Title>

                      <Text c="dimmed">{session.email}</Text>
                    </Stack>
                  </Group>

                  <Space h="md" />

                  <Tabs defaultValue="general">
                    <Tabs.List>
                      <Tabs.Tab value="general">General</Tabs.Tab>
                      <Tabs.Tab value="security">Security</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="general" pt="xl">
                      <SettingGeneralUpdateForm session={session} />
                    </Tabs.Panel>

                    <Tabs.Panel value="security" pt="xl">
                      <SettingPasswordUpdateForm />
                    </Tabs.Panel>
                  </Tabs>
                </Stack>
              </Container>
            </>
          )}
        </LocalQueryLoader>
      </AppLayout>
    </>
  );
}
