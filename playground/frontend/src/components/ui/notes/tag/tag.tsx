import { LocalQueryLoader } from "@/components/query_loader";
import { gateTan } from "@/configs/gate_tan";
import { ICON_SIZE } from "@folie/cobalt";
import { askConfirmation, For } from "@folie/cobalt/components";
import { DotProp } from "@folie/lib";
import { V1NoteShowRoute } from "@folie/playground-backend/blueprint";
import {
  Badge,
  Combobox,
  Group,
  Text,
  Tooltip,
  useCombobox,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMemo } from "react";
import { TagCreateForm } from "./tag_create_form";
import { useDisclosure } from "@mantine/hooks";

type Props = {
  note: V1NoteShowRoute["output"]["note"];
};

export const NoteTag = (props: Props) => {
  const {
    query: tagQ,
    body: tagBody,
    setBody: setTagBody,
  } = gateTan.useList({
    endpoint: "V1_TAG_LIST",
    input: {
      query: {
        page: 1,
        limit: 50,
        order: {
          by: "name",
          dir: "asc",
        },
      },
    },
  });

  const noteTagQ = gateTan.useQuery({
    endpoint: "V1_TAG_LIST",
    input: {
      query: {
        page: 1,
        limit: 50,
        order: {
          by: "name",
          dir: "asc",
        },
        filter: {
          noteId: props.note.id,
        },
      },
    },
  });

  const tagM = gateTan.useMutation({
    endpoint: "V1_NOTE_TAG_UPDATE",
    onSuccess: () => {
      noteTagQ.refetch();
    },
  });

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setTagBody({
        query: {
          ...tagBody.query,
          filter: {
            ...tagBody.query?.filter,
            name: undefined,
          },
        },
      });
    },

    onDropdownOpen: () => {
      tagQ.refetch();
      noteTagQ.refetch();
      combobox.focusSearchInput();
    },
  });

  const [tagCreateFormOpened, tagCreateFormHandlers] = useDisclosure(false, {
    onOpen: () => {
      combobox.closeDropdown();
    },
    onClose: () => {
      combobox.openDropdown();
    },
  });

  const options = useMemo(() => {
    if (!noteTagQ.data?.data || !tagQ.data?.data) return [];

    const existingTags = noteTagQ.data.data.map((tag) => tag.id);
    const availableTags = tagQ.data.data.filter(
      (tag) => !existingTags.includes(tag.id),
    );

    return availableTags.map((tag) => (
      <>
        <Combobox.Option value={tag.id} key={tag.id}>
          <Text size="sm">{tag.name}</Text>
        </Combobox.Option>
      </>
    ));
  }, [noteTagQ.data?.data, tagQ.data?.data]);

  return (
    <>
      <TagCreateForm
        refetch={tagQ.refetch}
        opened={tagCreateFormOpened}
        close={tagCreateFormHandlers.close}
      />

      <Group gap="xs">
        <LocalQueryLoader query={noteTagQ}>
          {({ data }) => (
            <>
              <For each={data}>
                {(tag) => (
                  <>
                    <Tooltip
                      opened={
                        (tag.description?.length ?? 0) > 0 ? undefined : false
                      }
                      label={tag.description}
                      multiline
                      w={220}
                      withArrow
                    >
                      <Badge
                        variant="filled"
                        color="dark.7"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={async () => {
                          const confirmation = await askConfirmation({
                            message: `Are you sure you want to remove tag "${tag.name}"?`,
                            labels: {
                              confirm: "Remove",
                            },
                          });

                          if (confirmation) {
                            tagM.mutate({
                              params: {
                                noteId: props.note.id,
                              },
                              action: "remove",
                              tagId: tag.id,
                            });
                          }
                        }}
                      >
                        {tag.name}
                      </Badge>
                    </Tooltip>
                  </>
                )}
              </For>
            </>
          )}
        </LocalQueryLoader>

        <Combobox
          store={combobox}
          width={250}
          position="bottom"
          withArrow
          withinPortal={false}
          positionDependencies={[noteTagQ.data?.data]}
          onOptionSubmit={(tagId) => {
            tagM.mutate({
              params: {
                noteId: props.note.id,
              },
              action: "add",
              tagId,
            });
          }}
        >
          <Combobox.Target>
            <Badge
              variant="filled"
              color="dark.7"
              leftSection={<IconPlus size={ICON_SIZE.XS} />}
              onClick={() => combobox.toggleDropdown()}
              style={{
                cursor: "pointer",
              }}
            >
              Add
            </Badge>
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Search
              disabled={tagQ.isLoading}
              value={DotProp.lookup(tagBody, "query.filter.name", "")}
              onChange={(event) => {
                const newValue = event.currentTarget.value;

                setTagBody({
                  query: {
                    ...tagBody.query,
                    filter: {
                      ...tagBody.query?.filter,
                      name: newValue.length > 0 ? newValue : undefined,
                    },
                  },
                });
              }}
              placeholder="Search tags"
            />

            <Combobox.Options>
              {options}

              <Combobox.Empty>
                <Text
                  size="sm"
                  fw="500"
                  c="white"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    tagCreateFormHandlers.open();
                  }}
                >
                  Create New
                </Text>
              </Combobox.Empty>
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </Group>
    </>
  );
};
