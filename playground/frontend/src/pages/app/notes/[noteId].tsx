import { AppLayout } from "@/components/layout/app";
import { gateServer } from "@/configs/gate_server";
import { noteCrumbs } from "@/lib/crumbs";
import { gateTan } from "@/configs/gate_tan";
import { gateClient } from "@/configs/gate_client";
import { LocalQueryLoader } from "@/components/query_loader";
import { NoteUpdateForm } from "@/components/ui/notes/update_form";

export const getServerSideProps = gateServer.checkpoint();

export default function Page() {
  const { isReady, param } = gateClient.useParams();

  const noteId = param.bind(null, "noteId");

  const noteQ = gateTan.useQuery({
    endpoint: "V1_NOTE_SHOW",
    input: {
      params: {
        noteId: noteId(),
      },
    },
    enabled: isReady,
  });

  return (
    <>
      <AppLayout
        crumbs={noteCrumbs.get([
          {
            label: noteQ.data?.note.title || "Untitled",
            href: noteId(),
          },
        ])}
      >
        <LocalQueryLoader query={noteQ}>
          {({ note }) => (
            <>
              <NoteUpdateForm note={note} refetch={() => noteQ.refetch()} />
            </>
          )}
        </LocalQueryLoader>
      </AppLayout>
    </>
  );
}
