import { NumberInput } from "@mantine/core";
import { getProperty } from "dot-prop";
import { setObjectProperty } from "./helper";
import { FieldSchema } from "@folie/service-formation-backend/types";

export const NumberOption = <T extends FieldSchema>(props: {
  label: string;
  description?: string;
  path: string;
  default?: number;
  value: T;
  onChange: (value: T) => void;
}) => {
  const defaultValue = props.default ?? 0;

  return (
    <NumberInput
      label={props.label}
      description={props.description}
      value={getProperty(props.value, props.path, defaultValue)}
      onChange={(e) => {
        props.onChange(
          setObjectProperty(props.value, props.path, Number(e), defaultValue),
        );
      }}
    />
  );
};
