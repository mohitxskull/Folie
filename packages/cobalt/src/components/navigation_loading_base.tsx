import { Center, Modal, ModalProps } from '@mantine/core'

type Props = Omit<ModalProps, 'onClose' | 'fullScreen' | 'withCloseButton'> & {
  opened: boolean
  children: React.ReactNode
  center: React.ReactNode
}

export const NavigationLoadingBase = (props: Props) => {
  const { opened, children, center, bg, ...rest } = props

  return (
    <>
      <Modal
        opened={opened}
        fullScreen
        onClose={() => {}}
        withCloseButton={false}
        transitionProps={{ transition: 'fade', duration: 500, exitDelay: 1500 }}
        styles={{
          body: {
            padding: 0,
          },
        }}
        bg={bg}
        {...rest}
      >
        <Center h="100vh" bg={bg}>
          {center}
        </Center>
      </Modal>

      <div
        style={{
          opacity: props.opened ? 0 : 1,
        }}
      >
        {children}
      </div>
    </>
  )
}
