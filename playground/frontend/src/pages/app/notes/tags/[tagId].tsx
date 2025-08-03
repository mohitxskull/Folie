import { AppLayout } from "@/components/layout/app";
import { tagCrumbs } from "@/lib/crumbs";
import { gateTan } from "@/configs/gate_tan";
import { gateClient } from "@/configs/gate_client";
import { QueryLoader } from "@/components/query_loader";
import { Container, Group, Skeleton, Stack } from "@mantine/core";
import { TagUpdateForm } from "@/components/ui/notes/tag/update_form";
import { Protected } from "@/components/protected";

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
      <Protected>
        <AppLayout
          crumbs={tagCrumbs.get([
            {
              label: tagQ.data?.tag.name || "Untitled",
              href: tagId(),
            },
          ])}
        >
          <Container pt="xl">
            <QueryLoader
              query={tagQ}
              loading={
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
            </QueryLoader>
          </Container>
        </AppLayout>
      </Protected>
    </>
  );
}
