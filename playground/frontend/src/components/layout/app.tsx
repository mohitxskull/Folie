import { AppShell, Button, Group } from "@mantine/core";
import { setting } from "@/configs/setting";
import { Logo } from "../logo";
import { useSignOut } from "@/lib/hooks/use_sign_out";
import Link from "next/link";
import { askConfirmation } from "@folie/cobalt/components";

type Props = {
  children: React.ReactNode;
  fullHeight?: boolean;
};

export const AppLayout = (props: Props) => {
  const [signOutM, signOut] = useSignOut();

  return (
    <>
      <AppShell header={{ height: setting.header.height }} padding="md">
        <AppShell.Header withBorder={false} bg="transparent">
          <Group justify="space-between" px="md" h="100%">
            <Logo href="/app" />

            <Group gap="xs">
              <Button
                size="sm"
                fw="500"
                variant="transparent"
                px="xs"
                disabled={signOutM.isPending}
                component={Link}
                href="/app/setting"
              >
                Setting
              </Button>

              <Button
                fw="500"
                variant="transparent"
                disabled={signOutM.isPending}
                c="red"
                px="xs"
                onClick={() => {
                  askConfirmation({
                    message: "Are you sure you want to logout?",
                    confirmLabel: "Logout",
                    onConfirm: () => signOut({}),
                  });
                }}
              >
                Logout
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main h={props.fullHeight ? `100vh` : "100%"} bg={setting.bg}>
          {props.children}
        </AppShell.Main>
      </AppShell>
    </>
  );
};
