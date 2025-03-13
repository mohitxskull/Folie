import { Avatar, AvatarProps } from "@mantine/core";
import BoringAvatar from "boring-avatars";

type Props = AvatarProps & {
  seed: string;
};

export const LocalBoringAvatar = (props: Props) => {
  const { seed, ...rest } = props;

  return (
    <>
      <Avatar radius="md" {...rest}>
        <BoringAvatar
          name={seed}
          square
          variant="beam"
          colors={["#141414", "#c9c9c9"]}
        />
      </Avatar>
    </>
  );
};
