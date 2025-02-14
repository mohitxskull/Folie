import { ICON_SIZE } from '@folie/cobalt'
import { ActionIcon, ActionIconProps, Menu, MenuProps } from '@mantine/core'
import { IconMenu2 } from '@tabler/icons-react'

type Props = {
  children: React.ReactNode
  props?: {
    root?: MenuProps
    actionIcon?: ActionIconProps
  }
}

export const ActionMenu = (props: Props) => {
  return (
    <>
      <Menu width={200} position="bottom-end" trigger="click-hover" {...props.props?.root}>
        <Menu.Target>
          <ActionIcon variant="transparent" c="dimmed" size="sm" {...props.props?.actionIcon}>
            <IconMenu2 size={ICON_SIZE.XS} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>{props.children}</Menu.Dropdown>
      </Menu>
    </>
  )
}
