import { AppLayout } from "@/components/layout/app";
import { ProfilePasswordUpdateForm } from "@/components/ui/profile/password_update_form";
import { ProfileUpdateForm } from "@/components/ui/profile/update_form";
import { cobaltServer } from "@/configs/cobalt_server";
import {
  FormWrapper,
  PageContainer,
  PageHeader,
} from "@folie/cobalt/components";
import { Divider, Stack } from "@mantine/core";
import { InferGetServerSidePropsType } from "next";

export const getServerSideProps = cobaltServer.secure();

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <>
      <AppLayout fullHeight>
        <>
          <PageContainer>
            <PageHeader
              title="Profile"
              description="Manage your personal details, workspace governance and notifications."
            />

            <FormWrapper>
              <Stack>
                <ProfileUpdateForm user={props.session} />

                <Divider mb="xs" />

                <PageHeader
                  title="Password"
                  description="Update your password associated with this account."
                  order={5}
                />

                <ProfilePasswordUpdateForm />
              </Stack>
            </FormWrapper>
          </PageContainer>
        </>
      </AppLayout>
    </>
  );
}
