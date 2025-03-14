import { AppLayout } from "@/components/layout/app";
import { LocalQueryLoader } from "@/components/query_loader";
import {
  Center,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
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
  });

  return (
    <>
      <AppLayout crumbs={noteCrumbs.get()}>
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
              <Container pt="xl">
                <Stack>
                  <Group justify="space-between">
                    <Title>Notes</Title>

                    <NoteCreateForm refetch={query.refetch} />
                  </Group>

                  <Show>
                    <Show.When isTrue={data.length === 0}>
                      <>
                        <Center h="50vh">
                          <Text fs="italic" fw="bold">
                            &quot;No notes found.&quot;
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
                            page={Number(body.query.page)}
                            limit={Number(body.query.limit)}
                            total={meta.total}
                          />

                          <SimplePagination
                            page={Number(body.query.page)}
                            limit={Number(body.query.limit)}
                            total={meta.total}
                            onChange={(page) => {
                              setBody({
                                ...body,
                                query: {
                                  ...body.query,
                                  page,
                                },
                              });
                            }}
                          />
                        </Group>
                      </>
                    </Show.Else>
                  </Show>
                </Stack>
              </Container>
            </>
          )}
        </LocalQueryLoader>
      </AppLayout>
    </>
  );
}
