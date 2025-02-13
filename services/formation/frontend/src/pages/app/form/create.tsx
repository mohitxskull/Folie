import { FormEditor } from "@/components/field_editor";
import { AppLayout } from "@/components/layout/app";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { Form, FormWrapper, PageHeader, RightGroup } from "@folie/cobalt/components";
import { Button, TextInput, Switch } from "@mantine/core";
import { useState } from "react";
import { FieldSchema } from "@folie/service-formation-backend/types";

export const getServerSideProps = cobaltServer.secure();

export default function Page() {
  const router = useRouter();

  const [captcha, setCaptcha] = useState(false);

  const [fields, fieldHandlers] = useListState<FieldSchema>([
    {
      key: "email",
      name: "Email",
      type: "string",
      sub: {
        type: "none",
      },
    },
  ]);

  const [form, iProps, iKey, [mutation, submit]] = cobalt.useForm({
    endpoint: "V1_FORM_CREATE",
    form: {
      values: {
        name: "",
        fields,
        captcha: null,
      },
    },
    onSuccess: (updatedData) => {
      notifications.show({
        message: updatedData.message,
      });

      router.push("/app/form");

      return {
        input: {
          name: "",
          fields: [],
          captcha: {
            private: "",
            public: "",
          },
        },
        queryKeys: (qk) => [qk("V1_FORM_LIST", undefined)],
      };
    },
  });

  return (
    <>
      <AppLayout>
        <>
          <PageHeader
            title="New Form"
            description="Create a new form."
            withBackBtn
          />

          <FormWrapper
            rightSection={
              <FormEditor fields={fields} fieldHandler={fieldHandlers} />
            }
          >
            <>
              <Form
                mutation={mutation}
                submit={(e) => {
                  submit({
                    ...e,
                    fields: fields,
                    captcha: captcha ? e.captcha : null,
                  });
                }}
                form={form}
              >
                {({ dirty, loading }) => (
                  <>
                    <TextInput
                      label="Name"
                      placeholder="Form Name"
                      {...iProps(["name"])}
                      key={iKey(["name"])}
                    />

                    <Switch
                      label="Captcha"
                      description="Only Cloudflare Turnstile is supported."
                      checked={captcha}
                      onChange={(event) =>
                        setCaptcha(event.currentTarget.checked)
                      }
                    />

                    {captcha && (
                      <>
                        <TextInput
                          label="Private Key"
                          placeholder="Turnstile private Key"
                          {...iProps(["captcha", "private"])}
                          key={iKey(["captcha", "private"])}
                        />

                        <TextInput
                          label="Public Key"
                          placeholder="Turnstile public Key"
                          {...iProps(["captcha", "public"])}
                          key={iKey(["captcha", "public"])}
                        />
                      </>
                    )}

                    <RightGroup>
                      <Button type="submit" loading={loading} disabled={!dirty}>
                        Create
                      </Button>
                    </RightGroup>
                  </>
                )}
              </Form>
            </>
          </FormWrapper>
        </>
      </AppLayout>
    </>
  );
}
