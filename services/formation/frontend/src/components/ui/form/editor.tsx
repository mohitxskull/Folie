import { cobalt } from "@/configs/cobalt";
import { V1FormShowRoute } from "@folie/service-formation-backend/blueprint";
import { FieldSchema } from "@folie/service-formation-backend/types";
import { useListState } from "@mantine/hooks";
import { FieldEditor } from "@/components/field_editor";

type Props = {
  form: V1FormShowRoute["output"];
  refetch: () => void;
};

export const FormEditor = (props: Props) => {
  const [fields, fieldHandlers] = useListState<FieldSchema>([
    {
      name: "Email",
      type: "string",
      sub: {
        type: "none",
      },
    },
  ]);

  const [form, iProps, iKey, [mutation, submit]] = cobalt.useForm({
    endpoint: "V1_FORM_UPDATE",
    form: {
      values: {
        params: {
          formId: props.form.id,
        },
      },
    },
    onSuccess: (updatedData) => {
      props.refetch();

      return {
        input: {
          params: {
            formId: updatedData.form.id,
          },
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
      <FieldEditor fields={fields} fieldHandler={fieldHandlers} />
    </>
  );
};
