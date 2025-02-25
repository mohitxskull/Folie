import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";

type Props = {
  loading?: boolean;
  title?: string;
  message: string;
  props?: Parameters<typeof modals.openConfirmModal>[0];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export const askConfirmation = (props: Props) => {
  modals.openConfirmModal({
    title: props.title || "Please confirm your action",
    children: (
      <>
        <Text size="sm">{props.message}</Text>
      </>
    ),
    closeOnCancel: true,
    closeOnConfirm: true,
    closeOnEscape: true,
    centered: true,
    withCloseButton: false,
    labels: {
      confirm: props.confirmLabel || "Confirm",
      cancel: props.cancelLabel || "Cancel",
    },
    confirmProps: {
      loading: props.loading,
      color: "red",
    },
    cancelProps: {
      disabled: props.loading,
      autoFocus: true,
    },
    onConfirm: () => props.onConfirm(),
    onCancel: () => props.onCancel?.(),
    ...props.props,
  });
};
