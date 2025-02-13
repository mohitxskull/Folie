import { AppLayout } from "@/components/layout/app";
import { LocalQueryLoader } from "@/components/query_loader";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { formatDate } from "@/lib/helpers/date";
import { Button, MenuItem } from "@mantine/core";
import Link from "next/link";
import {
  PageContainer,
  PageHeader,
  ActionMenu,
} from "@folie/cobalt/components";
import { LocalDataTable } from "@/components/data_table";
import { useRouter } from "next/router";

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
            <PageHeader title="Form" description="Manage your forms">
              <Button component={Link} href="/app/form/create">
                Create
              </Button>
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
                    onCellClick={({ record, column }) => {
                      if (column.accessor === "name") {
                        router.push(`/app/form/${record.id}`);
                      }
                    }}
                    columns={[
                      { accessor: "name" },
                      { accessor: "status" },
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
                      {
                        accessor: "actions",
                        title: "",
                        textAlign: "right",
                        render: (file) => (
                          <ActionMenu>
                            <MenuItem
                              component={Link}
                              href={`/app/form/${file.id}/submission`}
                            >
                              Submissions
                            </MenuItem>

                            <MenuItem
                              component={Link}
                              href={`/form/${file.id}`}
                            >
                              Submit
                            </MenuItem>
                          </ActionMenu>
                        ),
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
