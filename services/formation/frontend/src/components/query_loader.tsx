import {
  QueryLoaderProps,
  QueryLoader as CobaltQueryLoader,
} from "@folie/cobalt/components";

export const QueryLoader = <OUT,>(props: QueryLoaderProps<OUT>) => {
  return <CobaltQueryLoader {...props} />;
};
