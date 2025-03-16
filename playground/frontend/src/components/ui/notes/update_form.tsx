import {
  ActionIcon,
  Badge,
  Container,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { NoteTitleInput } from "@/components/ui/notes/title_input";
import { LazyNoteTextEditor } from "@/components/ui/notes/lazy_text_editor";
import { gateTan } from "@/configs/gate_tan";
import {
  V1NoteShowRoute,
  V1NoteUpdateRoute,
} from "@folie/playground-backend/blueprint";
import { useDebouncedCallback } from "@mantine/hooks";
import { OnValuesChangeParams } from "@folie/gate-tan/types";
import { useMemo, useState } from "react";
import { timeAgo } from "@/lib/helpers/date";
import LZString from "lz-string";
import { usePreventNavigation } from "@/lib/hooks/use_prevent_navigation";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { ICON_SIZE } from "@folie/cobalt";
import { useRouter } from "next/router";
import { NoteTag } from "./tag";

type Props = {
  note: V1NoteShowRoute["output"]["note"];
  refetch: () => void;
};

export const NoteUpdateForm = (props: Props) => {
  const router = useRouter();

  const [status, setStatus] = useState<"Saved" | "Unsaved" | "Error">("Saved");

  usePreventNavigation(status !== "Saved", () => {
    return confirm("Warning! You have unsaved changes.");
  });

  const decompressedBody = useMemo(() => {
    return LZString.decompressFromBase64(props.note.body);
  }, [props.note.body]);

  const handleSave = useDebouncedCallback(
    (values: OnValuesChangeParams<V1NoteUpdateRoute>) => {
      values.mutation.mutate({
        ...values.values,
        body: values.values.body
          ? LZString.compressToBase64(values.values.body)
          : values.values.body,
      });
    },
    2500,
  );

  const { form, inputProps } = gateTan.useForm({
    endpoint: "V1_NOTE_UPDATE",

    initialValues: {
      params: {
        noteId: props.note.id,
      },
      title: props.note.title,
      body: decompressedBody,
    },
    onValuesChange: (params) => {
      handleSave(params);
      setStatus("Unsaved");
    },
    onSuccess: () => {
      props.refetch();
      setStatus("Saved");
    },
    mutation: {
      onErrorHook: {
        after: () => {
          setStatus("Error");
        },
      },
    },
  });

  const deleteM = gateTan.useMutation({
    endpoint: "V1_NOTE_DELETE",
    onSuccess: () => {
      router.push("/app/notes");
    },
  });

  return (
    <>
      <Container pt="xl">
        <Stack>
          <Stack gap={0}>
            <Group justify="space-between">
              <Badge
                color={
                  status === "Saved"
                    ? "teal.5"
                    : status === "Unsaved"
                      ? "yellow"
                      : "red.5"
                }
                radius="sm"
                variant="light"
              >
                {status}
              </Badge>

              <Group>
                <Text c="dimmed" size="sm">
                  {timeAgo(props.note.updatedAt)}
                </Text>

                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="transparent" size="xs">
                      <IconDotsVertical />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={ICON_SIZE.SM} />}
                      onClick={() => {
                        deleteM.mutate({
                          params: {
                            noteId: props.note.id,
                          },
                        });
                      }}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            <NoteTitleInput
              {...inputProps("title")}
              key={form.key("title")}
              disabled={false}
            />

            <NoteTag note={props.note} />
          </Stack>

          <LazyNoteTextEditor {...inputProps("body")} key={form.key("body")} />
        </Stack>
      </Container>
    </>
  );
};
