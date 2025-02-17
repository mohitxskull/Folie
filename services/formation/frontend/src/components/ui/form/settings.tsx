import { HorizontalInput } from "@/components/horizontal_input";
import { cobalt } from "@/configs/cobalt";
import { Form, RightGroup } from "@folie/cobalt/components";
import { V1FormShowRoute } from "@folie/service-formation-backend/blueprint";
import { Alert, Button, Stack, Switch, TextInput, Title } from "@mantine/core";
import { useState } from "react";

type Props = {
  form: V1FormShowRoute["output"];
  refetch: () => void;
};

export const FormSettings = (props: Props) => {
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
      props.refetch();

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
                        Ensure the Formation domain is included in the HostName
                        to enable proper functionality of the widget.
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

            <RightGroup>
              <Button type="submit" loading={loading} disabled={!dirty}>
                Update
              </Button>
            </RightGroup>
          </>
        )}
      </Form>
    </>
  );
};
