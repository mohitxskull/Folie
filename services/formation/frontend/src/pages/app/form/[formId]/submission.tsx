import { AppLayout } from "@/components/layout/app";
import { QueryLoader } from "@/components/query_loader";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { formatDate } from "@/lib/helpers/date";
import { getProperty } from "dot-prop";
import { Box } from "@mantine/core";
import { PageHeader, VerticalTable } from "@folie/cobalt/components";

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

  const [listQ, [Body, setBody]] = cobalt.useList({
    endpoint: "V1_SUBMISSION_LIST",
    input: {
      params: {
        formId: formId(),
      },
      query: {
        limit: 10,
        page: 1,
        schemaVersion: 1,
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
          <QueryLoader query={formQ}>
            {(form) => (
              <>
                <PageHeader title="Submissions" description={form.name} />
              </>
            )}
          </QueryLoader>

          <QueryLoader query={listQ}>
            {(paginatedData) => (
              <>
                <DataTable
                  borderRadius="sm"
                  withTableBorder
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
                  highlightOnHover
                  records={paginatedData.data}
                  columns={paginatedData.schema.fields.reduce<
                    DataTableColumn<(typeof paginatedData)["data"][0]>[]
                  >(
                    (columns, field) => {
                      return [
                        {
                          accessor: field.key,
                          title: field.name,
                          render: (record) => {
                            return getProperty(record.fields, field.key);
                          },
                        },
                        ...columns,
                      ];
                    },
                    [
                      {
                        accessor: "createdAt",
                        render: (record) => formatDate(record.createdAt),
                      },
                    ],
                  )}
                  rowExpansion={{
                    content: ({ record }) => (
                      <>
                        <Box p="md">
                          <VerticalTable
                            label="Metadata"
                            autoCase
                            value={record.meta ?? {}}
                          />
                        </Box>
                      </>
                    ),
                  }}
                />
              </>
            )}
          </QueryLoader>
        </>
      </AppLayout>
    </>
  );
}
