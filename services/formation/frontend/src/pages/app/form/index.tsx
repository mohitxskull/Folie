import { AppLayout } from "@/components/layout/app";
import { QueryLoader } from "@/components/query_loader";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { DataTable } from "mantine-datatable";
import { IconEye, IconListTree, IconForms } from "@tabler/icons-react";
import { ICON_SIZE } from "@folie/cobalt";
import { formatDate } from "@/lib/helpers/date";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import Link from "next/link";
import { ActionGroup, PageContainer, PageHeader } from "@folie/cobalt/components";

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
                          <ActionGroup>
                            <Tooltip label="View">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                onClick={() =>
                                  router.push(`/app/form/${file.id}`)
                                }
                              >
                                <IconEye size={ICON_SIZE.XS} />
                              </ActionIcon>
                            </Tooltip>

                            <Tooltip label="Submissions">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                onClick={() =>
                                  router.push(`/app/form/${file.id}/submission`)
                                }
                              >
                                <IconListTree size={ICON_SIZE.XS} />
                              </ActionIcon>
                            </Tooltip>

                            <Tooltip label="Submit">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                onClick={() => router.push(`/form/${file.id}`)}
                              >
                                <IconForms size={ICON_SIZE.XS} />
                              </ActionIcon>
                            </Tooltip>
                          </ActionGroup>
                        ),
                      },
                    ]}
                  />
                </>
              )}
            </QueryLoader>
          </PageContainer>
        </>
      </AppLayout>
    </>
  );
}
