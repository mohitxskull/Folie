import { DataTable, DataTableProps } from "mantine-datatable";

export const LocalDataTable = <T,>(props: DataTableProps<T>) => (
  <>
    <DataTable
      textSelectionDisabled
      borderRadius="md"
      withTableBorder
      highlightOnHover
      {...props}
    />
  </>
);
