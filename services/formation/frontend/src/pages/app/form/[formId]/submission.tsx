import { AppLayout } from "@/components/layout/app";
import { LocalQueryLoader } from "@/components/query_loader";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { DataTableColumn } from "mantine-datatable";
import { formatDate } from "@/lib/helpers/date";
import { getProperty } from "dot-prop";
import { Box, Select } from "@mantine/core";
import {
  PageContainer,
  PageHeader,
  VerticalTable,
} from "@folie/cobalt/components";
import { LocalDataTable } from "@/components/data_table";
import { InferGetServerSidePropsType } from "next";

export const getServerSideProps = cobaltServer.server(
  async ({ params, api }) => {
    const formId = params("formId");

    const res = await api.endpoint("V1_FORM_SHOW").call({
      params: {
        formId: formId,
      },
    });

    return {
      props: {
        form: res,
      },
    };
  },
  true,
);

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const [listQ, [Body, setBody]] = cobalt.useList({
    endpoint: "V1_SUBMISSION_LIST",
    input: {
      params: {
        formId: props.form.id,
      },
      query: {
        limit: 20,
        page: 1,
        schemaVersion: 1,
      },
    },
  });

  return (
    <>
      <AppLayout fullHeight>
        <>
          <PageContainer>
            <PageHeader
              title={props.form.name}
              description="Form submissions."
              withBackBtn
            >
              <Select
                placeholder="Select version"
                value={String(Body.query.schemaVersion)}
                onChange={(v) => {
                  setBody({
                    query: {
                      ...Body.query,
                      schemaVersion: Number(v ?? 1),
                    },
                  });
                }}
                data={props.form.schema.map((s) => ({
                  label: `Version ${s.version}`,
                  value: String(s.version),
                }))}
              />
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
                          accessor: "form-submitted-at",
                          title: "Submitted At",
                          render: (record) => formatDate(record.createdAt),
                        },
                      ],
                    )}
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
