import { cobaltServer } from "@/configs/cobalt_server";
import { InferGetServerSidePropsType } from "next";
import { cobalt } from "@/configs/cobalt";
import { FormAppLayout } from "@/components/layout/form";
import { VerticalTable } from "@folie/cobalt/components";
import { Box } from "@mantine/core";
import { LocalQueryLoader } from "@/components/query_loader";
import { LocalDataTable } from "@/components/data_table";
import { DataTableColumn } from "mantine-datatable";
import { getProperty } from "dot-prop";
import { formatDate } from "@/lib/helpers/date";

export const getServerSideProps = cobaltServer.server(
  async ({ params, api }) => {
    const formId = params("formId");

    const form = await api.endpoint("V1_FORM_SHOW").call({
      params: {
        formId,
      },
    });

    return {
      props: {
        form,
      },
    };
  },
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
      },
    },
  });

  return (
    <>
      <FormAppLayout form={props.form} fullHeight>
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
                idAccessor="id"
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
                columns={(props.form.schema?.published ?? []).reduce<
                  DataTableColumn<(typeof paginatedData)["data"][0]>[]
                >(
                  (columns, field) => {
                    return [
                      {
                        accessor: field.slug,
                        title: field.name,
                        render: (record) => {
                          return getProperty(record.fields, String(field.key));
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
      </FormAppLayout>
    </>
  );
}
