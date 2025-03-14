import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'

type Props = Omit<Parameters<typeof modals.openConfirmModal>[0], 'labels'> & {
  loading?: boolean
  title?: string
  message: string
  labels?: {
    confirm?: string
    cancel?: string
  }
}

export const askConfirmation = (props: Props) => {
  const { loading, title, message, labels, confirmProps, cancelProps, ...rest } = props

  modals.openConfirmModal({
    title: title || 'Please confirm your action',
    children: (
      <>
        <Text size="sm">{message}</Text>
      </>
    ),
    closeOnCancel: true,
    closeOnConfirm: true,
    closeOnEscape: true,
    centered: true,
    withCloseButton: false,
    labels: {
      confirm: labels?.confirm || 'Confirm',
      cancel: labels?.cancel || 'Cancel',
    },
    confirmProps: {
      loading: loading,
      color: 'red.9',
      ...confirmProps,
    },
    cancelProps: {
      disabled: loading,
      autoFocus: true,
      ...cancelProps,
    },
    ...rest,
  })
}
