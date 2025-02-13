import { TextInput } from "@mantine/core";
import { getProperty } from "dot-prop";
import { setObjectProperty } from "./helper";
import { FieldSchema } from "@folie/service-formation-backend/types";

export const TextOption = <T extends FieldSchema>(props: {
  label: string;
  description?: string;
  path: string;
  default?: string;
  value: T;
  onChange: (value: T) => void;
}) => {
  const defaultValue = props.default ?? "";

  return (
    <TextInput
      label={props.label}
      description={props.description}
      value={getProperty(props.value, props.path, defaultValue)}
      onChange={(e) => {
        props.onChange(
          setObjectProperty(
            props.value,
            props.path,
            e.currentTarget.value,
            defaultValue,
          ),
        );
      }}
    />
  );
};
