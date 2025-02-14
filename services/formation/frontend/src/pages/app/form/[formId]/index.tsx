import { AppLayout } from "@/components/layout/app";
import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import {
  Form,
  FormWrapper,
  PageContainer,
  PageHeader,
  RightGroup,
} from "@folie/cobalt/components";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import { Alert, Button, Switch, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export const getServerSideProps = cobaltServer.server(
  async ({ params, api }) => {
    const formId = params("formId");

    const res = await api.endpoint("V1_FORM_SHOW").call({
      params: {
        formId: formId,
      },
    });

    return {
      props: {
        form: res,
      },
    };
  },
  { secure: true },
);

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const [captcha, setCaptcha] = useState(!!props.form.captcha);

  const [form, iProps, iKey, [mutation, submit]] = cobalt.useForm({
    endpoint: "V1_FORM_UPDATE",
    form: {
      values: {
        params: {
          formId: props.form.id,
        },
        name: props.form.name,
        active: props.form.status === "active",
        captcha: {
          private: "",
          public: props.form.captcha?.public ?? "",
        },
      },
    },
    onSuccess: (updatedData) => {
      notifications.show({
        message: updatedData.message,
      });

      return {
        input: {
          ...updatedData.form,
          params: {
            formId: updatedData.form.id,
          },
          captcha: {
            private: "",
            public: updatedData.form.captcha?.public ?? "",
          },
          active: updatedData.form.status === "active",
        },
        queryKeys: (qk) => [
          qk("V1_FORM_SHOW", { formId: updatedData.form.id }),
          qk("V1_FORM_LIST", undefined),
        ],
      };
    },
  });

  return (
    <>
      <AppLayout fullHeight>
        <>
          <PageContainer>
            <PageHeader
              title="File"
              description="Manage your files"
              withBackBtn
            />

            <FormWrapper>
              <Form
                mutation={mutation}
                submit={(f) => {
                  submit({
                    ...f,
                    captcha: captcha ? f.captcha : null,
                  });
                }}
                form={form}
              >
                {({ dirty, loading }) => (
                  <>
                    <TextInput
                      label="Name"
                      {...iProps(["name"])}
                      key={iKey(["name"])}
                    />

                    <Switch
                      label="Captcha"
                      description="Only Cloudflare Turnstile is supported."
                      checked={captcha}
                      onChange={(event) => {
                        const res = event.currentTarget.checked;

                        if (res === false) {
                          form.setValues((prev) => ({
                            ...prev,
                            captcha: {
                              private: "",
                              public: "",
                            },
                          }));
                        }

                        setCaptcha(res);
                      }}
                    />

                    {captcha && (
                      <>
                        <Alert>
                          Ensure the Formation domain is included in the
                          HostName to enable proper functionality of the widget.
                        </Alert>

                        <TextInput
                          label="Public Captcha"
                          placeholder="Turnstile Captcha Public Key ( Site Key )"
                          {...iProps(["captcha", "public"])}
                          key={iKey(["captcha", "public"])}
                        />

                        <TextInput
                          label="Private Captcha"
                          placeholder="Turnstile Captcha Private Key ( Secret Key )"
                          {...iProps(["captcha", "private"])}
                          key={iKey(["captcha", "private"])}
                        />
                      </>
                    )}

                    <Switch
                      label="Active"
                      description="Only active forms can accept submission"
                      {...iProps(["active"], {
                        type: "checkbox",
                      })}
                      key={iKey(["active"])}
                    />

                    <RightGroup>
                      <Button type="submit" loading={loading} disabled={!dirty}>
                        Update
                      </Button>
                    </RightGroup>
                  </>
                )}
              </Form>
            </FormWrapper>
          </PageContainer>
        </>
      </AppLayout>
    </>
  );
}
