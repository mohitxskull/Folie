import {
  ActionIcon,
  AppShell,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Text,
} from "@mantine/core";
import { setting } from "@/configs/setting";
import { Logo } from "../logo";
import { useSignOut } from "@/lib/hooks/use_sign_out";
import Link from "next/link";
import { askConfirmation, For, If } from "@folie/cobalt/components";
import { IconLayoutSidebarFilled, IconNotebook } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Crumbs } from "@/lib/types";
import { ICON_SIZE } from "@folie/cobalt";

type Props = {
  children: React.ReactNode;
  fullHeight?: boolean;
  crumbs?: Crumbs;
};

export const AppLayout = (props: Props) => {
  const signOutM = useSignOut();

  const [opened, { toggle }] = useDisclosure();

  return (
    <>
      <AppShell
        header={{ height: setting.header.height }}
        navbar={{
          width: 250,
          breakpoint: "sm",
          collapsed: { mobile: !opened, desktop: opened },
        }}
        padding="md"
        layout="alt"
      >
        <AppShell.Header withBorder={false} bg="transparent">
          <Group justify="space-between" px="md" h="100%">
            <Group>
              <ActionIcon
                variant="transparent"
                size="sm"
                c="dimmed"
                onClick={toggle}
              >
                <IconLayoutSidebarFilled />
              </ActionIcon>

              {props.crumbs && (
                <>
                  <Group gap="xs">
                    <For
                      each={props.crumbs}
                      render={(crumb, crumbIndex) => (
                        <>
                          <Text
                            size="sm"
                            fw="500"
                            component={Link}
                            href={crumb.href}
                          >
                            {crumb.label}
                          </Text>

                          <If
                            isTrue={
                              crumbIndex !== (props.crumbs?.length ?? 0) - 1
                            }
                          >
                            <Text size="sm" fw="500">
                              /
                            </Text>
                          </If>
                        </>
                      )}
                    />
                  </Group>
                </>
              )}
            </Group>

            <Group gap="xs">
              <Button
                size="sm"
                fw="500"
                variant="transparent"
                px="xs"
                disabled={signOutM.isPending}
                component={Link}
                href="/app/settings"
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
                    onConfirm: () => signOutM.mutate(undefined),
                  });
                }}
              >
                Logout
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <AppShell.Section>
            <Group justify="space-between">
              <Logo href="/app" />

              <ActionIcon
                variant="transparent"
                size="sm"
                c="dimmed"
                onClick={toggle}
                hiddenFrom="sm"
              >
                <IconLayoutSidebarFilled />
              </ActionIcon>
            </Group>
          </AppShell.Section>
          <AppShell.Section grow my="md" component={ScrollArea}>
            <NavLink
              leftSection={<IconNotebook size={ICON_SIZE.SM} />}
              label="Notes"
              href="/app/notes"
            />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main h={props.fullHeight ? `100vh` : "100%"}>
          {props.children}
        </AppShell.Main>
      </AppShell>
    </>
  );
};
