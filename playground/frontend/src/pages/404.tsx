import { Center, Stack, Text, Title } from "@mantine/core";

export default function Page() {
  return (
    <>
      <Center h="100vh">
        <Stack>
          <Title mx="auto" size="15vw">
            404
          </Title>

          <Text mx="auto" size="xl">
            Page not found
          </Text>
        </Stack>
      </Center>
    </>
  );
}
