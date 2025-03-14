import { Group, Text } from "@mantine/core";
import { TextButton } from "./text_button";

type Props = {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
};

export const SimplePagination = (props: Props) => {
  const { page, limit, total, onChange } = props;

  return (
    <>
      <Group>
        <Text size="sm" c="dimmed" fw="500">
          {page} of {Math.ceil(total / limit)} pages
        </Text>

        <TextButton
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          size="sm"
          fw="500"
        >
          Prev
        </TextButton>

        <TextButton
          disabled={page === Math.ceil(total / limit)}
          onClick={() => onChange(page + 1)}
          size="sm"
          fw="500"
        >
          Next
        </TextButton>
      </Group>
    </>
  );
};
