import { DefaultMantineColor, InputLabel, Stack, Table, TableProps, Text } from '@mantine/core'
import { randomId } from '@mantine/hooks'
import { capitalCase } from 'case-anything'

export const VerticalTable = (props: {
  value: Record<string, unknown> | null
  autoCase?: boolean
  props?: TableProps
  label?: string
  bg?: DefaultMantineColor
  noTableBorder?: boolean
  emptyValue?: string
}) => {
  if (!props.value || Object.keys(props.value).length === 0) {
    return props.emptyValue ?? '-'
  }

  return (
    <>
      <Stack gap={0}>
        {props.label && (
          <>
            <InputLabel>{props.label}</InputLabel>
          </>
        )}
        <Table
          {...props.props}
          variant="vertical"
          layout="fixed"
          withTableBorder={!props.noTableBorder}
          bg={props.bg || 'white'}
        >
          <Table.Tbody bg="white">
            {Object.entries(props.value).map(([key, value]) => (
              <Table.Tr key={randomId()}>
                <Table.Th w={160} bg="transparent">
                  <Text size="sm" c="dimmed">
                    {props.autoCase ? capitalCase(key) : key}
                  </Text>
                </Table.Th>
                <Table.Td>
                  {(() => {
                    switch (typeof value) {
                      case null:
                      case 'undefined':
                      case 'string':
                      case 'number':
                      case 'boolean': {
                        return (
                          <>
                            <Text size="sm">{value ? capitalCase(String(value)) : '-'}</Text>
                          </>
                        )
                      }

                      default:
                        return value as React.ReactNode
                    }
                  })()}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </>
  )
}
