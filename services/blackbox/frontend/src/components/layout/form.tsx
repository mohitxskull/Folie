import { V1FormShowRoute } from "@folie/service-formation-backend/blueprint";
import { AppLayout } from "./app";
import { useRouter } from "next/router";
import { PageContainer, PageHeader } from "@folie/cobalt/components";
import { Tabs } from "@mantine/core";
import { IconForms, IconLayoutList, IconSettings } from "@tabler/icons-react";
import { ICON_SIZE } from "@folie/cobalt";
import { useMemo } from "react";

type Props = {
  children: React.ReactNode;
  form: V1FormShowRoute["output"];
  footer?: { children: React.ReactNode };
  fullHeight?: boolean;
};

export const FormAppLayout = (props: Props) => {
  const router = useRouter();

  const activeTab = useMemo(() => {
    return new URL(router.asPath, "http://example.com").pathname;
  }, [router.asPath]);

  console.log(router);

  return (
    <>
      <AppLayout footer={props.footer} fullHeight={props.fullHeight}>
        <PageContainer
          props={{
            stack: {
              gap: 0,
            },
          }}
        >
          <>
            <PageHeader title={props.form.name} order={1} withBackBtn />

            <Tabs
              mb="md"
              keepMounted={false}
              value={activeTab}
              onChange={(value) => {
                if (value && value !== activeTab) {
                  router.push(value);
                }
              }}
            >
              <Tabs.List>
                <Tabs.Tab
                  value={`/app/form/${props.form.id}`}
                  leftSection={<IconSettings size={ICON_SIZE.SM} />}
                >
                  Settings
                </Tabs.Tab>
                <Tabs.Tab
                  value={`/app/form/${props.form.id}/submission`}
                  disabled={!props.form.schema.published}
                  leftSection={<IconLayoutList size={ICON_SIZE.SM} />}
                >
                  Submissions
                </Tabs.Tab>
                <Tabs.Tab
                  value={`/app/form/${props.form.id}/field`}
                  leftSection={<IconForms size={ICON_SIZE.SM} />}
                >
                  Fields
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            {props.children}
          </>
        </PageContainer>
      </AppLayout>
    </>
  );
};
