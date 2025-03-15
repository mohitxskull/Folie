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
import {
  getTypedProperty,
  setTypedProperty,
} from "@/lib/helpers/set_object_property";

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
      timeout: 1000,
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
              value={getTypedProperty(body, "query.filter.title", "")}
              onChange={(e) => {
                setBody(
                  setTypedProperty(
                    body,
                    "query.filter.title",
                    e.currentTarget.value,
                    "",
                  ),
                );
              }}
            />

            <Divider
              classNames={{
                root: "big-dash",
              }}
              variant="dashed"
            />
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
                            <Show>
                              <Show.When
                                isTrue={
                                  getTypedProperty(
                                    body,
                                    "query.filter.title",
                                    "",
                                  ) !== ""
                                }
                              >
                                {`No notes found for "${getTypedProperty(
                                  body,
                                  "query.filter.title",
                                  "",
                                )}"`}
                              </Show.When>
                              <Show.Else>&quot;No notes found.&quot;</Show.Else>
                            </Show>
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
                            page={getTypedProperty(body, "query.page", 1)}
                            limit={getTypedProperty(body, "query.limit", 10)}
                            total={meta.total}
                          />

                          <SimplePagination
                            page={getTypedProperty(body, "query.page", 1)}
                            limit={getTypedProperty(body, "query.limit", 10)}
                            total={meta.total}
                            onChange={(page) => {
                              setBody(
                                setTypedProperty(body, "query.page", page, 1),
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
