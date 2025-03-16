import { Modal, ModalProps, Stack } from '@mantine/core'

type Props = Omit<ModalProps, 'onClose'> & {
  children: React.ReactNode
  opened: boolean
  close: () => void
  open: () => void
  target: React.ReactNode
}

export const TriggeredModal = (props: Props) => {
  const { children, opened, close, open, target, ...rest } = props

  return (
    <>
      <Modal {...rest} withCloseButton={false} centered opened={opened} onClose={close}>
        <Stack>{children}</Stack>
      </Modal>

      {target}
    </>
  )
}
