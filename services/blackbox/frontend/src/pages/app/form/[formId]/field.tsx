import { cobaltServer } from "@/configs/cobalt_server";
import { InferGetServerSidePropsType } from "next";
import { FormAppLayout } from "@/components/layout/form";
import { useListState } from "@mantine/hooks";
import { FieldSchema } from "@folie/service-formation-backend/types";
import { FieldEditor } from "@/components/field_editor";
import { cobalt } from "@/configs/cobalt";
import { useState } from "react";
import { RightGroup } from "@folie/cobalt/components";
import { Button } from "@mantine/core";

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
  const [propsState, setPropsState] = useState(props);

  const [fields, fieldHandlers] = useListState<FieldSchema>(
    propsState.form.schema.draft ||
      propsState.form.schema.published || [
        {
          name: "Email",
          type: "string",
          sub: {
            type: "none",
          },
        },
      ],
  );

  const [updateM, submitUpdate] = cobalt.useMutation({
    endpoint: "V1_FORM_UPDATE",
    onSuccess: (updatedData) => {
      setPropsState((p) => ({ ...p, form: updatedData.form }));
      fieldHandlers.setState(
        updatedData.form.schema.draft ||
          updatedData.form.schema.published ||
          [],
      );
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
                  submitUpdate({
                    params: {
                      formId: propsState.form.id,
                    },
                    publish: true,
                  });
                }}
                loading={updateM.isPending}
                disabled={!propsState.form.schema.draft}
                variant="outline"
              >
                Publish
              </Button>
              <Button
                onClick={() => {
                  submitUpdate({
                    params: {
                      formId: propsState.form.id,
                    },
                    fields,
                  });
                }}
                loading={updateM.isPending}
              >
                Save
              </Button>
            </RightGroup>
          ),
        }}
      >
        <FieldEditor fields={fields} fieldHandler={fieldHandlers} />
      </FormAppLayout>
    </>
  );
}
