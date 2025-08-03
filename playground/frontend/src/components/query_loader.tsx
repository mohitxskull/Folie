import {
  QueryLoaderBase,
  QueryLoaderBaseProps,
} from "@folie/cobalt/components";
import { Alert } from "@mantine/core";

export const QueryLoader = <OUT,>(props: QueryLoaderBaseProps<OUT>) => {
  return (
    <QueryLoaderBase
      error={
        <Alert color="red.5" variant="light">
          Error
        </Alert>
      }
      {...props}
    />
  );
};
