import { AppLayout } from "@/components/layout/app";
import { QueryLoader } from "@/components/query_loader";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { FormUpdateForm } from "@/components/ui/form/update_form";
import { FormWrapper, PageContainer, PageHeader } from "@folie/cobalt/components";

export const getServerSideProps = cobaltServer.secure();

export default function Page() {
  const { isReady, param } = cobalt.useParams();

  const formId = param.bind(null, "formId");

  const formQ = cobalt.useQuery({
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
      <AppLayout fullHeight>
        <>
          <PageContainer>
            <PageHeader
              title="File"
              description="Manage your files"
              withBackBtn
            />

            <QueryLoader query={formQ}>
              {(form) => (
                <>
                  <FormWrapper>
                    <>
                      <FormUpdateForm form={form} />
                    </>
                  </FormWrapper>
                </>
              )}
            </QueryLoader>
          </PageContainer>
        </>
      </AppLayout>
    </>
  );
}
