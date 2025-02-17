import { AppLayout } from "@/components/layout/app";
import { cobaltServer } from "@/configs/cobalt_server";
import { PageContainer, PageHeader } from "@folie/cobalt/components";
import { Tabs } from "@mantine/core";
import { IconForms, IconLayoutList, IconSettings } from "@tabler/icons-react";
import { ICON_SIZE } from "@folie/cobalt";
import { FormSubmissions } from "@/components/ui/form/submissions";
import { FormSettings } from "@/components/ui/form/settings";
import { cobalt } from "@/configs/cobalt";
import { LocalQueryLoader } from "@/components/query_loader";
import { FormEditor } from "@/components/ui/form/editor";

export const getServerSideProps = cobaltServer.secure();

export default function Page() {
  const { isReady, param } = cobalt.useParams();

  const formId = param.bind(null, "formId");

  const showQ = cobalt.useQuery({
    endpoint: "V1_FORM_SHOW",
    input: {
      params: {
        formId: formId(),
      },
    },
    props: {
      enabled: isReady,
    },
  });

  return (
    <>
      <AppLayout>
        <>
          <PageContainer
            props={{
              stack: {
                gap: 0,
              },
            }}
          >
            <LocalQueryLoader query={showQ}>
              {(form) => (
                <>
                  <PageHeader title={form.name} order={1} withBackBtn />

                  <Tabs
                    keepMounted={false}
                    defaultValue={
                      form.schema.published ? "submissions" : "fields"
                    }
                  >
                    <Tabs.List>
                      <Tabs.Tab
                        value="submissions"
                        disabled={!form.schema.published}
                        leftSection={<IconLayoutList size={ICON_SIZE.SM} />}
                      >
                        Submissions
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="fields"
                        leftSection={<IconForms size={ICON_SIZE.SM} />}
                      >
                        Fields
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="settings"
                        leftSection={<IconSettings size={ICON_SIZE.SM} />}
                      >
                        Settings
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="fields" pt="md">
                      <FormEditor form={form} refetch={showQ.refetch} />
                    </Tabs.Panel>

                    <Tabs.Panel value="submissions" pt="md">
                      <FormSubmissions form={form} />
                    </Tabs.Panel>

                    <Tabs.Panel value="settings" pt="md">
                      <FormSettings form={form} refetch={showQ.refetch} />
                    </Tabs.Panel>
                  </Tabs>
                </>
              )}
            </LocalQueryLoader>
          </PageContainer>
        </>
      </AppLayout>
    </>
  );
}
