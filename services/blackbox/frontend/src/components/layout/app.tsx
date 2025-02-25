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
  aside?: { children: React.ReactNode; width?: number };
  footer?: { children: React.ReactNode };
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
                width: props.aside?.width ?? setting.navbar.width,
                breakpoint: "sm",
              }
            : undefined
        }
        footer={props.footer ? { height: setting.footer.height } : undefined}
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
              {props.aside.children}
            </AppShell.Aside>
          </>
        )}

        {props.footer && (
          <>
            <AppShell.Footer p="md" bg={setting.footer.bg}>
              {props.footer.children}
            </AppShell.Footer>
          </>
        )}

        <AppShell.Main h={props.fullHeight ? `100vh` : "100%"} bg={setting.bg}>
          <Stack h="100%">{props.children}</Stack>
        </AppShell.Main>
      </AppShell>
    </>
  );
};
