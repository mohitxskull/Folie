import { Badge, Container, Group, Stack, Text } from "@mantine/core";
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

type Props = {
  note: V1NoteShowRoute["output"]["note"];
  refetch: () => void;
};

export const NoteUpdateForm = (props: Props) => {
  const [status, setStatus] = useState<"Saved" | "Unsaved" | "Error">("Saved");

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

              <Text c="dimmed" size="sm">
                {timeAgo(props.note.updatedAt)}
              </Text>
            </Group>

            <NoteTitleInput
              {...inputProps("title")}
              key={form.key("title")}
              disabled={false}
            />
          </Stack>

          <LazyNoteTextEditor {...inputProps("body")} key={form.key("body")} />
        </Stack>
      </Container>
    </>
  );
};
