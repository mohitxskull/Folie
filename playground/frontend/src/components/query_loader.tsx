import { QueryLoaderProps, QueryLoader } from "@folie/cobalt/components";
import { Alert } from "@mantine/core";

export const LocalQueryLoader = <OUT,>(props: QueryLoaderProps<OUT>) => {
  return (
    <QueryLoader
      isError={
        <Alert color="red.5" variant="light">
          Error
        </Alert>
      }
      {...props}
    />
  );
};
