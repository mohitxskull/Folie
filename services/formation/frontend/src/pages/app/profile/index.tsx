import { AppLayout } from "@/components/layout/app";
import { ProfilePasswordUpdateForm } from "@/components/ui/profile/password_update_form";
import { ProfileUpdateForm } from "@/components/ui/profile/update_form";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { FormWrapper, PageContainer, PageHeader, QueryLoader } from "@folie/cobalt/components";
import { Divider, Stack } from "@mantine/core";

export const getServerSideProps = cobaltServer.secure();

export default function Page() {
  const query = cobalt.useQuery({
    endpoint: "V1_AUTH_PROFILE_SHOW",
    input: undefined,
  });

  return (
    <>
      <AppLayout fullHeight>
        <>
          <PageContainer>
            <PageHeader
              title="Profile"
              description="Manage your personal details, workspace governance and notifications."
            />

            <QueryLoader query={query}>
              {(user) => (
                <>
                  <FormWrapper>
                    <Stack>
                      <ProfileUpdateForm user={user} />

                      <Divider mb="xs" />

                      <PageHeader
                        title="Password"
                        description="Update your password associated with this account."
                        order={5}
                      />

                      <ProfilePasswordUpdateForm />
                    </Stack>
                  </FormWrapper>
                </>
              )}
            </QueryLoader>
          </PageContainer>
        </>
      </AppLayout>
    </>
  );
}
