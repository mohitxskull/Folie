import { AppLayout } from "@/components/layout/app";
import { gateServer } from "@/configs/gate_server";
import { noteCrumbs } from "@/lib/crumbs";
import { gateTan } from "@/configs/gate_tan";
import { gateClient } from "@/configs/gate_client";
import { LocalQueryLoader } from "@/components/query_loader";
import { NoteUpdateForm } from "@/components/ui/notes/update_form";
import { Container, Group, Skeleton, Space, Stack } from "@mantine/core";

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
        <Container pt="xl">
          <LocalQueryLoader
            query={noteQ}
            isLoading={
              <>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Skeleton width={60} height={20} radius="sm" />

                    <Group gap="xs">
                      <Skeleton width={60} height={20} radius="sm" />

                      <Skeleton width={20} height={20} radius="sm" />
                    </Group>
                  </Group>

                  <Skeleton height={40} radius="sm" />

                  <Skeleton width={60} height={20} radius="lg" />

                  <Skeleton height={400} radius="sm" />
                </Stack>
              </>
            }
          >
            {({ note }) => (
              <>
                <NoteUpdateForm note={note} refetch={() => noteQ.refetch()} />

                <Space h="xl" />
              </>
            )}
          </LocalQueryLoader>
        </Container>
      </AppLayout>
    </>
  );
}
