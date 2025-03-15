import { deleteProperty, getProperty, setProperty } from "dot-prop";

export const setTypedProperty = <
  T extends object,
  V extends string | number | boolean,
>(
  obj: T,
  path: string,
  value: V,
  defaultValue: V,
): T => {
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

export const getTypedProperty = <
  T extends object,
  V extends string | number | boolean,
>(
  obj: T,
  path: string,
  defaultValue: V,
): V => {
  const value = getProperty(obj, path, defaultValue);

  if (typeof value === "string") {
    return value as V;
  }

  if (typeof value === "number") {
    return value as V;
  }

  if (typeof value === "boolean") {
    return value as V;
  }

  throw new Error(`Invalid type for path ${path}`);
};
