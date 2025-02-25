import { useSession } from "@/lib/hooks/use_session";
import { useSignOut } from "@/lib/hooks/use_sign_out";
import { Avatar, Group, Menu, Stack, Text } from "@mantine/core";
import { askConfirmation } from "@/lib/helpers/confirmation_modal";
import React from "react";
import Link from "next/link";
import { LocalQueryLoader } from "../query_loader";
import { setting } from "@/configs/setting";

export const NavbarFooterMenu = () => {
  const session = useSession();

  const [mutation, signout] = useSignOut();

  return (
    <>
      <LocalQueryLoader query={session}>
        {(user) => (
          <>
            <Menu
              shadow="md"
              width={setting.navbar.width - 10}
              disabled={mutation.isPending}
              position="bottom-end"
              opened={mutation.isPending ? false : undefined}
              offset={20}
            >
              <Menu.Target>
                <Group
                  gap="0"
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <Avatar radius="sm">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Avatar>

                  <Stack px="xs" gap="0">
                    <Text size="sm">
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text size="xs">{user.email}</Text>
                  </Stack>
                </Group>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} href="/app/profile">
                  Profile
                </Menu.Item>

                <Menu.Item component={Link} href="/app/profile/key">
                  Key
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  onClick={() => {
                    askConfirmation({
                      message: "Are you sure you want to logout?",
                      confirmLabel: "Logout",
                      onConfirm: () => signout({}),
                    });
                  }}
                  color="red"
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </>
        )}
      </LocalQueryLoader>
    </>
  );
};
