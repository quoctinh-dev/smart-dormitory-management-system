import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';

export default function AssignmentInfo({ assignment }) {
  if (!assignment) return null;

  return (
    <Box 
      sx={{ 
        mb: 4, 
        p: 3, 
        bgcolor: (theme) => alpha(theme.palette.info.main, 0.08), 
        borderRadius: 4, 
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.info.main, 0.25)
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main', mb: 1 }}>
        THÔNG TIN XẾP PHÒNG
      </Typography>
      
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
        Hệ thống đã tự động sắp xếp chỗ ở cho bạn dựa trên điểm ưu tiên và nguyện vọng đăng ký.
      </Typography>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Typography sx={{ color: 'text.secondary' }}>Tòa nhà:</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>
            {assignment.buildingName || 'Chưa rõ'}
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 6 }}>
          <Typography sx={{ color: 'text.secondary' }}>Tầng:</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>
            {assignment.floorName || 'Chưa rõ'}
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 6 }}>
          <Typography sx={{ color: 'text.secondary' }}>Phòng:</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography sx={{ fontWeight: 'bold', textAlign: 'right', color: 'primary.main' }}>
            {assignment.roomName || 'Chưa rõ'}
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 6 }}>
          <Typography sx={{ color: 'text.secondary' }}>Giường số:</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography sx={{ fontWeight: 'bold', textAlign: 'right', color: 'error.main' }}>
            {assignment.bedName || 'Chưa phân'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}