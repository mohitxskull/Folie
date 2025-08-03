import { AppLayout } from "@/components/layout/app";
import { QueryLoader } from "@/components/query_loader";
import {
  Button,
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
  Tooltip,
} from "@mantine/core";
import { noteCrumbs } from "@/lib/crumbs";
import { gateTan } from "@/configs/gate_tan";
import { For, Show } from "@folie/cobalt/components";
import { timeAgo } from "@/lib/helpers/date";
import { PaginationRange } from "@/components/pagination_range";
import { SimplePagination } from "@/components/simple_pagination";
import { useRouter } from "next/router";
import { DotProp } from "@folie/lib";
import { TagBadge } from "@/components/ui/notes/tag/badge";
import { IconPlus, IconTagFilled } from "@tabler/icons-react";
import { ICON_SIZE } from "@folie/cobalt";
import { TagManageAside } from "@/components/ui/notes/tag/manage";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { Protected } from "@/components/protected";

export default function Page() {
  const router = useRouter();

  const [tagManageState, setTagManageState] = useState(false);

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

  const createM = gateTan.useMutation({
    endpoint: "V1_NOTE_CREATE",
    onSuccess: (updatedData) => {
      notifications.show({
        message: updatedData.message,
      });

      router.push(`/app/notes/${updatedData.note.id}`);
    },
  });

  return (
    <>
      <Protected>
        <AppLayout
          crumbs={noteCrumbs.get()}
          aside={{
            state: tagManageState,
            setState: setTagManageState,
            children: (
              <TagManageAside
                state={tagManageState}
                setState={setTagManageState}
              />
            ),
          }}
        >
          <Container pt="xl">
            <Stack>
              <Group justify="space-between">
                <Title>Notes</Title>

                <Group>
                  <Button
                    leftSection={<IconPlus size={ICON_SIZE.SM} />}
                    onClick={() => createM.mutate(undefined)}
                    loading={createM.isPending}
                  >
                    Create
                  </Button>

                  <Tooltip label="Manage Tags" position="bottom-end">
                    <Button
                      px="xs"
                      variant="outline"
                      onClick={() => setTagManageState(!tagManageState)}
                    >
                      <IconTagFilled size={ICON_SIZE.SM} />
                    </Button>
                  </Tooltip>
                </Group>
              </Group>

              <TextInput
                minLength={1}
                maxLength={100}
                description='Use "tag:" to search by tag, or enter keywords to search by note title'
                placeholder="Search notes..."
                value={DotProp.lookup(body, "query.filter.value", "")}
                onChange={(e) => {
                  const newValue = e.currentTarget.value;

                  setBody({
                    query: {
                      ...body.query,
                      filter: newValue !== "" ? { value: newValue } : undefined,
                    },
                  });
                }}
              />

              <Divider />

              <QueryLoader
                query={query}
                loading={
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
                                const filterValue = DotProp.lookup(
                                  body,
                                  "query.filter.value",
                                  "",
                                );

                                if (filterValue !== "") {
                                  return `No notes found for "${filterValue}"`;
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
                                  <Stack>
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

                                    {note.tags.length > 0 && (
                                      <Group gap="xs">
                                        <For each={note.tags}>
                                          {(tag) => (
                                            <>
                                              <TagBadge
                                                color="dark.9"
                                                tag={tag}
                                              />
                                            </>
                                          )}
                                        </For>
                                      </Group>
                                    )}
                                  </Stack>
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
              </QueryLoader>
            </Stack>
          </Container>
        </AppLayout>
      </Protected>
    </>
  );
}
