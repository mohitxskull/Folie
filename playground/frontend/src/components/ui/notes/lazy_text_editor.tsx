import dynamic from "next/dynamic";

export const LazyNoteTextEditor = dynamic(
  () => import("./text_editor").then((d) => d.NoteTextEditor),
  {
    loading: () => <p>Loading...</p>,
  },
);
