import { cobalt } from "@/configs/cobalt";
import { cobaltServer } from "@/configs/cobalt_server";
import { InferGetServerSidePropsType } from "next";
import { notifications } from "@mantine/notifications";
import { useMemo, useRef, useState } from "react";
import { Form, PageContainer, RightGroup } from "@folie/cobalt/components";
import { Button, TextInput, NumberInput, Center, Box } from "@mantine/core";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

export const getServerSideProps = cobaltServer.server(
  async ({ params, api }) => {
    const formId = params("formId");

    const res = await api.endpoint("V1_PUBLIC_FORM_SHOW").call({
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
);

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const captchaRef = useRef<TurnstileInstance>(undefined);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const fields = useMemo(() => {
    return props.form.fields.reduce<Record<string, string | number | null>>(
      (acc, curr) => {
        return {
          ...acc,
          [curr.key]:
            curr.type === "string" ? "" : curr.type === "number" ? null : "",
        };
      },
      {},
    );
  }, [props.form.fields]);

  const [form, iProps, iKey, [mutation, submit]] = cobalt.useForm({
    endpoint: "V1_PUBLIC_SUBMISSION_CREATE",
    form: {
      values: {
        params: {
          formId: props.form.id,
        },
        fields: fields,
      },
    },
    onSuccess: (updatedData) => {
      notifications.show({
        message: updatedData.message,
      });

      captchaRef.current?.reset();
      setCaptchaToken(null);

      return {
        input: {
          params: {
            formId: props.form.id,
          },
          fields: fields,
        },
      };
    },
    mutation: {
      onErr: () => {
        captchaRef.current?.reset();
        setCaptchaToken(null);
      },
    },
  });

  return (
    <>
      <PageContainer>
        <Center>
          <Box miw={400}>
            <Form
              mutation={mutation}
              submit={(v) => {
                submit({
                  ...v,
                  query: {
                    ...v.query,
                    captcha: props.form.captcha ? captchaToken : undefined,
                  },
                });
              }}
              form={form}
            >
              {({ dirty, loading }) => (
                <>
                  {props.form.fields.map((field) => {
                    switch (field.type) {
                      case "string": {
                        return (
                          <>
                            <TextInput
                              label={field.name}
                              placeholder="Placeholder text"
                              minLength={field.options?.minLength}
                              maxLength={field.options?.maxLength}
                              required={field.options?.required}
                              {...iProps(["fields", field.key])}
                              key={iKey(["fields", field.key])}
                            />
                          </>
                        );
                      }

                      case "number": {
                        return (
                          <>
                            <NumberInput
                              label={field.name}
                              placeholder="Placeholder text"
                              min={field.options?.min}
                              max={field.options?.max}
                              required={field.options?.required}
                              {...iProps(["fields", field.key])}
                              key={iKey(["fields", field.key])}
                            />
                          </>
                        );
                      }
                    }
                  })}

                  {props.form.captcha && (
                    <>
                      <Turnstile
                        ref={captchaRef}
                        siteKey={props.form.captcha.public}
                        onSuccess={(t) => {
                          setCaptchaToken(t);
                        }}
                        onExpire={() => {
                          notifications.show({
                            title: "Captcha Expired",
                            message: "Complete it again",
                          });

                          setCaptchaToken(null);
                        }}
                        onError={() => {
                          notifications.show({
                            title: "Captcha Error",
                            message: "Please try again",
                          });

                          setCaptchaToken(null);
                        }}
                        options={{
                          size: "flexible",
                        }}
                      />
                    </>
                  )}

                  <RightGroup>
                    <Button
                      type="submit"
                      loading={loading}
                      disabled={
                        !dirty || (!!props.form.captcha && !captchaToken)
                      }
                    >
                      Submit
                    </Button>
                  </RightGroup>
                </>
              )}
            </Form>
          </Box>
        </Center>
      </PageContainer>
    </>
  );
}
