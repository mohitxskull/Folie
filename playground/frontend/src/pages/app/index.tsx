import { AppLayout } from "@/components/layout/app";
import { Protected } from "@/components/protected";
import { homeCrumbs } from "@/lib/crumbs";
import { Center, Text } from "@mantine/core";

export default function Page() {
  return (
    <>
      <Protected>
        <>
          <AppLayout fullHeight crumbs={homeCrumbs.get()}>
            <Center h="100%">
              <Text fs="italic" fw="bold">
                “Still thinking what to do is a waste of time” MAster
              </Text>
            </Center>
          </AppLayout>
        </>
      </Protected>
    </>
  );
}
