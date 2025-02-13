import { deleteProperty, getProperty, setProperty } from "dot-prop";

export const setObjectProperty = <
  T extends object,
  V extends string | number | boolean,
>(
  obj: T,
  path: string,
  value: V,
  defaultValue: V,
) => {
  let res = obj;

  if (value === defaultValue) {
    deleteProperty(res, path);
  } else {
    res = setProperty(res, path, value);
  }

  const parentPath = path.split(".").slice(0, -1).join(".");

  const parentObj = getProperty(res, parentPath, {});

  if (Object.keys(parentObj || {}).length < 1) {
    deleteProperty(res, parentPath);
  }

  return res;
};
