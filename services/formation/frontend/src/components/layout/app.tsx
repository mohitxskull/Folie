import {
  AppShell,
  MantineSpacing,
  NavLink,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { Logo } from "../logo";
import { setting } from "@/configs/setting";
import { Icon, IconForms, IconHome } from "@tabler/icons-react";
import { Children } from "react";
import { ICON_SIZE } from "@folie/cobalt";
import { NavbarFooterMenu } from "./navbar_footer_menu";

type Props = {
  children: React.ReactNode;
  fullHeight?: boolean;
  padding?: MantineSpacing;
  aside?: React.ReactNode;
  asideProps?: {
    width?: number;
  };
};

const Links: {
  label: string;
  icon: Icon;
  href?: string;
  children?: {
    label: string;
    href: string;
  }[];
}[] = [
  {
    label: "Home",
    icon: IconHome,
    href: "/app",
  },
  {
    label: "Forms",
    icon: IconForms,
    href: "/app/form",
  },
];

export const AppLayout = (props: Props) => {
  return (
    <>
      <AppShell
        padding={props.padding ?? "md"}
        layout="alt"
        navbar={{
          width: setting.navbar.width,
          breakpoint: "sm",
        }}
        aside={
          props.aside
            ? {
                width: props.asideProps?.width ?? setting.navbar.width,
                breakpoint: "sm",
              }
            : undefined
        }
      >
        <AppShell.Navbar p="md" bg={setting.navbar.bg}>
          <AppShell.Section>
            <Logo size="lg" href="/app" />
          </AppShell.Section>
          <AppShell.Section
            grow
            renderRoot={(props) => (
              <ScrollArea type="never" scrollbars="y" {...props} />
            )}
          >
            <Stack gap={0}>
              {Children.toArray(
                Links.map((link) => (
                  <NavLink
                    href={link.href}
                    label={link.label}
                    leftSection={<link.icon size={ICON_SIZE.SM} />}
                    px={0}
                    bg="transparent"
                    childrenOffset={link.children ? 32 : undefined}
                    defaultOpened
                  >
                    {link.children &&
                      link.children.map((child) => (
                        <>
                          <NavLink
                            label={child.label}
                            href={child.href}
                            px={0}
                            bg="transparent"
                          />
                        </>
                      ))}
                  </NavLink>
                )),
              )}
            </Stack>
          </AppShell.Section>
          <AppShell.Section>
            <NavbarFooterMenu />
          </AppShell.Section>
        </AppShell.Navbar>

        {props.aside && (
          <>
            <AppShell.Aside p="md" bg={setting.navbar.bg}>
              {props.aside}
            </AppShell.Aside>
          </>
        )}

        <AppShell.Main h={props.fullHeight ? `100vh` : "100%"} bg={setting.bg}>
          <Stack h="100%">{props.children}</Stack>
        </AppShell.Main>
      </AppShell>
    </>
  );
};
