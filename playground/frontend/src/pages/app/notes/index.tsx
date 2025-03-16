import { AppLayout } from "@/components/layout/app";
import { LocalQueryLoader } from "@/components/query_loader";
import {
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Paper,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { gateServer } from "@/configs/gate_server";
import { noteCrumbs } from "@/lib/crumbs";
import { gateTan } from "@/configs/gate_tan";
import { For, Show } from "@folie/cobalt/components";
import { NoteCreateForm } from "@/components/ui/notes/create_form";
import { timeAgo } from "@/lib/helpers/date";
import { PaginationRange } from "@/components/pagination_range";
import { SimplePagination } from "@/components/simple_pagination";
import { useRouter } from "next/router";
import { DotProp } from "@folie/lib";

export const getServerSideProps = gateServer.checkpoint();

export default function Page() {
  const router = useRouter();

  const { body, query, setBody } = gateTan.useList({
    endpoint: "V1_NOTE_LIST",
    input: {
      query: {
        page: 1,
        limit: 10,
        order: {
          by: "updatedAt",
          dir: "desc",
        },
      },
    },
    debounce: {
      timeout: 500,
    },
  });

  return (
    <>
      <AppLayout crumbs={noteCrumbs.get()}>
        <Container pt="xl">
          <Stack>
            <Group justify="space-between">
              <Title>Notes</Title>

              <NoteCreateForm refetch={query.refetch} />
            </Group>

            <TextInput
              minLength={1}
              maxLength={100}
              placeholder="Search notes..."
              value={DotProp.lookup(body, "query.filter.title", "")}
              onChange={(e) => {
                const newTitle = e.currentTarget.value;

                setBody({
                  query: {
                    ...body.query,
                    filter: newTitle !== "" ? { title: newTitle } : undefined,
                  },
                });
              }}
            />

            <Divider />

            <LocalQueryLoader
              query={query}
              isLoading={
                <>
                  <Center h="100vh">
                    <Loader />
                  </Center>
                </>
              }
            >
              {({ data, meta }) => (
                <>
                  <Show>
                    <Show.When isTrue={data.length === 0}>
                      <>
                        <Center h="50vh">
                          <Text fs="italic" fw="bold">
                            {(() => {
                              const filterTitle = DotProp.lookup(
                                body,
                                "query.filter.title",
                                "",
                              );

                              if (filterTitle !== "") {
                                return `No notes found for "${filterTitle}"`;
                              } else {
                                return `"No notes found."`;
                              }
                            })()}
                          </Text>
                        </Center>
                      </>
                    </Show.When>

                    <Show.Else>
                      <>
                        <For each={data}>
                          {(note) => (
                            <>
                              <Paper
                                p="md"
                                onClick={() =>
                                  router.push(`/app/notes/${note.id}`)
                                }
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                <Group justify="space-between">
                                  <Title order={4} flex={1}>
                                    <Text inherit truncate="end" maw="60%">
                                      {note.title}
                                    </Text>
                                  </Title>

                                  <Text c="dimmed" size="sm">
                                    {timeAgo(note.updatedAt)}
                                  </Text>
                                </Group>
                              </Paper>
                            </>
                          )}
                        </For>

                        <Group justify="space-between">
                          <PaginationRange
                            page={DotProp.lookup(body, "query.page", 1)}
                            limit={DotProp.lookup(body, "query.limit", 10)}
                            total={meta.total}
                          />

                          <SimplePagination
                            page={DotProp.lookup(body, "query.page", 1)}
                            limit={DotProp.lookup(body, "query.limit", 10)}
                            total={meta.total}
                            onChange={(page) => {
                              setBody(
                                DotProp.assignOrOmit(
                                  body,
                                  "query.page",
                                  page,
                                  1,
                                ),
                              );
                            }}
                          />
                        </Group>

                        <Space h="xl" />
                      </>
                    </Show.Else>
                  </Show>
                </>
              )}
            </LocalQueryLoader>
          </Stack>
        </Container>
      </AppLayout>
    </>
  );
}
