import { Center, Modal } from '@mantine/core'

type Props = {
  opened: boolean
  children: React.ReactNode
  center: React.ReactNode
}

export const NavigationLoadingBase = (props: Props) => {
  return (
    <>
      <Modal
        opened={props.opened}
        fullScreen
        onClose={() => {}}
        withCloseButton={false}
        transitionProps={{ transition: 'fade', duration: 500, exitDelay: 1500 }}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <Center h="100vh" bg="gray.1">
          {props.center}
        </Center>
      </Modal>

      <div
        style={{
          opacity: props.opened ? 0 : 1,
        }}
      >
        {props.children}
      </div>
    </>
  )
}
