import { cobaltServer } from "@/configs/cobalt_server";
import { InferGetServerSidePropsType } from "next";
import { useRef, useState } from "react";
import { cobalt } from "@/configs/cobalt";
import { FormAppLayout } from "@/components/layout/form";
import { Form, RightGroup } from "@folie/cobalt/components";
import { Alert, Button, Stack, Switch, TextInput, Title } from "@mantine/core";
import { HorizontalInput } from "@/components/horizontal_input";

export const getServerSideProps = cobaltServer.server(
  async ({ params, api }) => {
    const formId = params("formId");

    const form = await api.endpoint("V1_FORM_SHOW").call({
      params: {
        formId,
      },
    });

    return {
      props: {
        form,
      },
    };
  },
);

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const [propsState, setPropsState] = useState(props);

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
        publish: undefined,
      },
    },
    onSuccess: (updatedData) => {
      setPropsState((p) => ({
        ...p,
        form: updatedData.form,
      }));

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
      <FormAppLayout
        form={propsState.form}
        footer={{
          children: (
            <RightGroup h="100%">
              <Button
                onClick={() => {
                  if (btnRef.current) {
                    btnRef.current.click();
                  }
                }}
                loading={mutation.isPending}
                disabled={!form.isDirty()}
              >
                Save
              </Button>
            </RightGroup>
          ),
        }}
      >
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
          {() => (
            <>
              <Title order={4}>General</Title>

              <HorizontalInput
                label="Name"
                description="This is the name of the form. Will be displayed to users."
              >
                <TextInput {...iProps(["name"])} key={iKey(["name"])} />
              </HorizontalInput>

              <HorizontalInput
                label="Active"
                description="Only active forms can accept submission"
              >
                <Switch
                  {...iProps(["active"], {
                    type: "checkbox",
                  })}
                  key={iKey(["active"])}
                />
              </HorizontalInput>

              <HorizontalInput
                label="Captcha"
                description="Only Cloudflare Turnstile is supported."
                expand={{
                  active: captcha,
                  children: (
                    <>
                      <Stack>
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
                      </Stack>
                    </>
                  ),
                }}
              >
                <Switch
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
              </HorizontalInput>

              <button ref={btnRef} type="submit" hidden />
            </>
          )}
        </Form>
      </FormAppLayout>
    </>
  );
}
