import { Box, Typography } from '@mui/material';

interface TableLabelDisplayedRowsProps {
  from: number;
  to: number;
  count: number;
}

const TableLabelDisplayedRows = ({ from, to, count }: TableLabelDisplayedRowsProps) => {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline-block' }, mr: 0.5 }}>
        Đang hiển thị
      </Box>
      <Typography
        component="span"
        variant="body2"
        sx={{ fontWeight: 'bold', color: 'primary.main' }}
      >
        {from} - {to}
      </Typography>
      <Box component="span" sx={{ mx: 0.5 }}>
        /
      </Box>
      <Typography component="span" variant="body2" sx={{ fontWeight: 'bold' }}>
        {count !== -1 ? count : `hơn ${to}`}
      </Typography>
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline-block' }, ml: 0.5 }}>
        dòng
      </Box>
    </Typography>
  );
};

export default TableLabelDisplayedRows;
