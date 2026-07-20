import { TablePagination, useEventCallback } from '@mui/material';
import { GridSlotProps } from '@mui/x-data-grid';
import { ChangeEvent } from 'react';

import DataGridPaginationAction from './DataGridPaginationAction';
import TableLabelDisplayedRows from './TableLabelDisplayedRows';

type BasePaginationProps = GridSlotProps['pagination'];

const DataGridPagination = function BasePagination(props: any) {
  const { onRowsPerPageChange, disabled, showFullPagination = false, showAllHref, ...rest } = props;

  return (
    <TablePagination
      showFirstButton
      showLastButton
      component="div"
      ActionsComponent={(actionProps: any) => (
        <DataGridPaginationAction showFullPagination={showFullPagination} {...actionProps} />
      )}
      onRowsPerPageChange={useEventCallback(
        (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
          onRowsPerPageChange?.(Number(event.target.value));
        }
      )}
      labelDisplayedRows={({ from, to, count }) => (
        <TableLabelDisplayedRows from={from} to={to} count={count} />
      )}
      {...rest}
    />
  );
};

export default DataGridPagination;
