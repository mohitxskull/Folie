import { Text, TextProps } from "@mantine/core";

type Props = TextProps & {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export const TextButton = (props: Props) => {
  const { children, disabled, onClick, style, c, ...rest } = props;

  return (
    <>
      <Text
        onClick={onClick}
        c={disabled ? "dimmed" : c}
        style={{
          ...style,
          cursor: disabled ? "auto" : "pointer",
          pointerEvents: disabled ? "none" : "auto",
        }}
        {...rest}
      >
        {children}
      </Text>
    </>
  );
};
