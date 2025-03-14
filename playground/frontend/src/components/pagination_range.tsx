import { Text, TextProps } from "@mantine/core";

type Props = TextProps & {
  page: number;
  limit: number;
  total: number;
};

export const PaginationRange = (props: Props) => {
  const { page, limit, total, ...rest } = props;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <Text size="sm" c="dimmed" fw="500" {...rest}>
      {start} to {end} of {total} results
    </Text>
  );
};
