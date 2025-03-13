import { AppLayout } from "@/components/layout/app";
import { gateServer } from "@/configs/gate_server";
import { homeCrumbs } from "@/lib/crumbs";
import { Center, Text } from "@mantine/core";

export const getServerSideProps = gateServer.checkpoint();

export default function Page() {
  return (
    <>
      <AppLayout fullHeight crumbs={homeCrumbs.get()}>
        <Center h="100%">
          <Text fs="italic" fw="bold">
            “Still thinking what to do is a waste of time”
          </Text>
        </Center>
      </AppLayout>
    </>
  );
}
