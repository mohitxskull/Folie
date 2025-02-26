import { AppLayout } from "@/components/layout/app";
import { cobaltServer } from "@/configs/cobalt_server";
import { Center, Text } from "@mantine/core";

export const getServerSideProps = cobaltServer.secure();

export default function Page() {
  return (
    <>
      <AppLayout fullHeight>
        <>
          <Center h="100%">
            <Text fs="italic" fw="bold">
              “Still thinking what to do is a waste of time”
            </Text>
          </Center>
        </>
      </AppLayout>
    </>
  );
}
