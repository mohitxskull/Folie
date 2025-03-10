import { QueryLoaderProps, QueryLoader } from "@folie/cobalt/components";

export const LocalQueryLoader = <OUT,>(props: QueryLoaderProps<OUT>) => {
  return <QueryLoader {...props} />;
};
