import { cobalt } from "@/configs/cobalt";
import { Form, RightGroup } from "@folie/cobalt/components";
import { V1FormShowRoute } from "@folie/service-formation-backend/blueprint";
import { Button, Switch, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

type Props = {
  form: V1FormShowRoute["output"];
};

export const FormUpdateForm = (props: Props) => {
  const [captcha, setCaptcha] = useState(false);

  const [form, iProps, iKey, [mutation, submit]] = cobalt.useForm({
    endpoint: "V1_FORM_UPDATE",
    form: {
      values: {
        params: {
          formId: props.form.id,
        },
        name: "",
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
          status:
            updatedData.form.status === "deleted"
              ? null
              : updatedData.form.status,
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
            <TextInput label="Name" readOnly value={props.form.name} />

            <Switch
              label="Captcha"
              description="Only Cloudflare Turnstile is supported."
              checked={captcha}
              onChange={(event) => setCaptcha(event.currentTarget.checked)}
            />

            {captcha && (
              <>
                <TextInput
                  label="Captcha"
                  placeholder="Turnstile Captcha Private Key"
                  {...iProps(["captcha", "private"])}
                  key={iKey(["captcha", "private"])}
                />

                <TextInput
                  label="Captcha"
                  placeholder="Turnstile Captcha Public Key"
                  {...iProps(["captcha", "public"])}
                  key={iKey(["captcha", "public"])}
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
    </>
  );
};
