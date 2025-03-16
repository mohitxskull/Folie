import { Skeleton, Stack } from "@mantine/core";
import dynamic from "next/dynamic";

export const LazyNoteTextEditor = dynamic(
  () => import("./text_editor").then((d) => d.NoteTextEditor),
  {
    loading: () => (
      <>
        <Stack>
          <Skeleton height={40} radius="sm" />

          <Skeleton height={300} radius="sm" />
        </Stack>
      </>
    ),
  },
);
