import { Switch } from "@mantine/core";
import { getProperty } from "dot-prop";
import { setObjectProperty } from "./helper";
import { FieldSchema } from "@folie/service-formation-backend/types";

export const SwitchOption = <T extends FieldSchema>(props: {
  label: string;
  description?: string;
  path: string;
  default?: boolean;
  value: T;
  onChange: (value: T) => void;
}) => {
  const defaultValue = props.default ?? false;

  return (
    <Switch
      label={props.label}
      description={props.description}
      checked={getProperty(props.value, props.path, defaultValue)}
      onChange={(e) => {
        props.onChange(
          setObjectProperty(
            props.value,
            props.path,
            e.currentTarget.checked,
            defaultValue,
          ),
        );
      }}
    />
  );
};
