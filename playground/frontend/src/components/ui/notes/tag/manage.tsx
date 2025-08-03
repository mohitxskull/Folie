import { QueryLoader } from "@/components/query_loader";
import { gateTan } from "@/configs/gate_tan";
import { For, Show } from "@folie/cobalt/components";
import { DotProp } from "@folie/lib";
import {
  ActionIcon,
  AppShellSection,
  Center,
  CloseButton,
  Flex,
  Group,
  Loader,
  Paper,
  ScrollAreaAutosize,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { TagCreateForm } from "./create_form";
import Link from "next/link";

type Props = {
  state: boolean;
  setState: (value: boolean) => void;
};

export const TagManageAside = (props: Props) => {
  const { body, query, setBody } = gateTan.useList({
    endpoint: "V1_TAG_LIST",
    input: {
      query: {
        page: 1,
        limit: 50,
        order: {
          by: "updatedAt",
          dir: "desc",
        },
        properties: {
          metric: true,
        },
      },
    },
    debounce: {
      timeout: 500,
    },
    enabled: props.state,
  });

  const [tagCreateModalState, setTagCreateModalState] = useState(false);

  return (
    <>
      <TagCreateForm
        opened={tagCreateModalState}
        refetch={query.refetch}
        close={() => setTagCreateModalState(false)}
      />

      <AppShellSection>
        <Group justify="space-between">
          <CloseButton
            variant="transparent"
            onClick={() => props.setState(!props.state)}
          />

          <Title c="white" order={5} fw="600">
            Manage Tags
          </Title>
        </Group>
      </AppShellSection>
      <AppShellSection mt="md">
        <Stack h="100%">
          <Flex justify="center" align="center" direction="row" gap="xs">
            <TextInput
              flex={1}
              minLength={1}
              maxLength={100}
              placeholder="Search tags..."
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

            <ActionIcon
              size="sm"
              variant="transparent"
              onClick={() => setTagCreateModalState(true)}
            >
              <IconPlus />
            </ActionIcon>
          </Flex>

          <QueryLoader
            query={query}
            loading={
              <>
                <Center h="100%">
                  <Loader />
                </Center>
              </>
            }
          >
            {({ data }) => (
              <>
                <Show>
                  <Show.When isTrue={data.length === 0}>
                    <>
                      <Center h="100%">
                        <Text fs="italic" fw="bold">
                          {(() => {
                            const filterValue = DotProp.lookup(
                              body,
                              "query.filter.value",
                              "",
                            );

                            if (filterValue !== "") {
                              return `No tags found for "${filterValue}"`;
                            } else {
                              return `"No tags found."`;
                            }
                          })()}
                        </Text>
                      </Center>
                    </>
                  </Show.When>

                  <Show.Else>
                    <>
                      <ScrollAreaAutosize mah="80vh" type="never">
                        <Stack h="100%" mb="md">
                          <For each={data}>
                            {(tag) => (
                              <>
                                <Paper
                                  component={Link}
                                  p="md"
                                  href={`/app/notes/tags/${tag.id}`}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                >
                                  <Group justify="space-between">
                                    <Title order={6} flex={1}>
                                      <Text inherit truncate="end" maw="60%">
                                        {tag.name}
                                      </Text>
                                    </Title>

                                    <Text c="dimmed" size="sm">
                                      {tag.metric?.notes}
                                    </Text>
                                  </Group>
                                </Paper>
                              </>
                            )}
                          </For>
                        </Stack>
                      </ScrollAreaAutosize>
                    </>
                  </Show.Else>
                </Show>
              </>
            )}
          </QueryLoader>
        </Stack>
      </AppShellSection>
    </>
  );
};
