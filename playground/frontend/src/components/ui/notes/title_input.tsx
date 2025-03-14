import { Textarea, TextareaProps } from "@mantine/core";

type Props = TextareaProps;

export const NoteTitleInput = (props: Props) => {
  return (
    <>
      <Textarea
        placeholder="Title"
        variant="unstyled"
        minLength={1}
        maxLength={100}
        autosize
        styles={{
          input: {
            fontSize: "40px",
            fontWeight: "bold",
            border: "none",
          },
        }}
        {...props}
      />
    </>
  );
};
