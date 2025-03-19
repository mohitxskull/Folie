import { AppLayout } from "@/components/layout/app";
import { gateServer } from "@/configs/gate_server";
import { tagCrumbs } from "@/lib/crumbs";
import { gateTan } from "@/configs/gate_tan";
import { gateClient } from "@/configs/gate_client";
import { LocalQueryLoader } from "@/components/query_loader";
import { Container, Group, Skeleton, Stack } from "@mantine/core";
import { TagUpdateForm } from "@/components/ui/notes/tag/update_form";

export const getServerSideProps = gateServer.checkpoint();

export default function Page() {
  const { isReady, param } = gateClient.useParams();

  const tagId = param.bind(null, "tagId");

  const tagQ = gateTan.useQuery({
    endpoint: "V1_TAG_SHOW",
    input: {
      params: {
        tagId: tagId(),
      },
    },
    enabled: isReady,
  });

  return (
    <>
      <AppLayout
        crumbs={tagCrumbs.get([
          {
            label: tagQ.data?.tag.name || "Untitled",
            href: tagId(),
          },
        ])}
      >
        <Container pt="xl">
          <LocalQueryLoader
            query={tagQ}
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
            {({ tag }) => (
              <>
                <TagUpdateForm tag={tag} />
              </>
            )}
          </LocalQueryLoader>
        </Container>
      </AppLayout>
    </>
  );
}
