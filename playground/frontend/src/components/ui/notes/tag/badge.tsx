import { askConfirmation } from "@folie/cobalt/components";
import { V1TagShowRoute } from "@folie/playground-backend/blueprint";
import { Badge, DefaultMantineColor, Tooltip } from "@mantine/core";

type Props = {
  tag: V1TagShowRoute["output"]["tag"];
  remove?: () => void;
  color?: DefaultMantineColor;
};

export const TagBadge = (props: Props) => {
  const { tag } = props;

  return (
    <>
      <Tooltip
        opened={(tag.description?.length ?? 0) > 0 ? undefined : false}
        label={tag.description}
        multiline
        w={220}
        withArrow
      >
        <Badge
          variant="filled"
          color={props.color ?? "dark.8"}
          style={{
            cursor: props.remove ? "pointer" : "default",
          }}
          onClick={
            props.remove
              ? async () => {
                  const confirmation = await askConfirmation({
                    message: `Are you sure you want to remove tag "${tag.name}"?`,
                    labels: {
                      confirm: "Remove",
                    },
                  });

                  if (confirmation) {
                    props.remove?.();
                  }
                }
              : undefined
          }
        >
          {tag.name}
        </Badge>
      </Tooltip>
    </>
  );
};
