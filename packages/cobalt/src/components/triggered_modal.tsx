import { Modal, ModalProps, Stack } from '@mantine/core'

type Props = {
  children: React.ReactNode
  modal?: ModalProps
  opened: boolean
  close: () => void
  open: () => void
  target: React.ReactNode
}

export const TriggeredModal = (props: Props) => {
  return (
    <>
      <Modal
        {...props.modal}
        withCloseButton={false}
        centered
        opened={props.opened}
        onClose={props.close}
      >
        <Stack>{props.children}</Stack>
      </Modal>

      {props.target}
    </>
  )
}
