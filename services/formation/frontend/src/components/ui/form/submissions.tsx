import { LocalDataTable } from "@/components/data_table";
import { LocalQueryLoader } from "@/components/query_loader";
import { cobalt } from "@/configs/cobalt";
import { formatDate } from "@/lib/helpers/date";
import { VerticalTable } from "@folie/cobalt/components";
import { V1FormShowRoute } from "@folie/service-formation-backend/blueprint";
import { Box } from "@mantine/core";
import { getProperty } from "dot-prop";
import { DataTableColumn } from "mantine-datatable";

type Props = {
  form: V1FormShowRoute["output"];
};

export const FormSubmissions = (props: Props) => {
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
    </>
  );
};
