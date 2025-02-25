import { AppLayout } from "@/components/layout/app";
import { LocalQueryLoader } from "@/components/query_loader";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { formatDate } from "@/lib/helpers/date";
import { PageContainer, PageHeader } from "@folie/cobalt/components";
import { LocalDataTable } from "@/components/data_table";
import { useRouter } from "next/router";
import { capitalCase } from "case-anything";
import { FormCreateModalForm } from "@/components/ui/form/create_modal_form";

export const getServerSideProps = cobaltServer.secure();

export default function Page() {
  const router = useRouter();

  const [listQ, [Body, setBody]] = cobalt.useList({
    endpoint: "V1_FORM_LIST",
    input: {
      query: {
        limit: 10,
        page: 1,
      },
    },
  });

  return (
    <>
      <AppLayout fullHeight>
        <>
          <PageContainer>
            <PageHeader
              title="Forms"
              description="You can manage your forms here."
            >
              <FormCreateModalForm refetch={listQ.refetch} />
            </PageHeader>

            <LocalQueryLoader query={listQ}>
              {(paginatedData) => (
                <>
                  <LocalDataTable
                    fetching={listQ.isFetching}
                    page={paginatedData.meta.page}
                    onPageChange={(p) => {
                      setBody({
                        query: {
                          ...Body.query,
                          page: p,
                        },
                      });
                    }}
                    totalRecords={paginatedData.meta.total.object}
                    recordsPerPage={paginatedData.meta.limit}
                    records={paginatedData.data}
                    onCellClick={({ record }) => {
                      router.push(`/app/form/${record.id}`);
                    }}
                    columns={[
                      { accessor: "name" },
                      {
                        accessor: "status",
                        render: (f) => capitalCase(f.status),
                      },
                      {
                        accessor: "captcha",
                        render: (f) => (f.captcha ? "Enabled" : "Disabled"),
                      },
                      {
                        accessor: "createdAt",
                        render: (record) => formatDate(record.createdAt),
                      },
                      {
                        accessor: "updatedAt",
                        render: (record) => formatDate(record.updatedAt),
                      },
                    ]}
                  />
                </>
              )}
            </LocalQueryLoader>
          </PageContainer>
        </>
      </AppLayout>
    </>
  );
}
