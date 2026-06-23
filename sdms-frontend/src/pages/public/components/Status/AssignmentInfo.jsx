import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

export default function AssignmentInfo({ assignment }) {
    if (!assignment) return null;

    return (
        <Box sx={{ mb: 4, p: 3, bgcolor: '#e0f2fe', borderRadius: 4, border: '1px solid #bae6fd' }}>
            <Typography variant="h6" fontWeight="bold" color="primary.dark" gutterBottom>
                THÔNG TIN XẾP PHÒNG
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={2}>
                Hệ thống đã tự động sắp xếp chỗ ở cho bạn dựa trên điểm ưu tiên và nguyện vọng.
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><Typography color="text.secondary">Tòa nhà:</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography fontWeight="bold" align="right">{assignment.buildingName || 'Chưa rõ'}</Typography></Grid>
                
                <Grid size={{ xs: 6 }}><Typography color="text.secondary">Tầng:</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography fontWeight="bold" align="right">{assignment.floorName || 'Chưa rõ'}</Typography></Grid>
                
                <Grid size={{ xs: 6 }}><Typography color="text.secondary">Phòng:</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography fontWeight="bold" align="right" color="primary.main">{assignment.roomName || 'Chưa rõ'}</Typography></Grid>
                
                <Grid size={{ xs: 6 }}><Typography color="text.secondary">Giường số:</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography fontWeight="bold" align="right" color="error.main">{assignment.bedName || 'Chưa phân'}</Typography></Grid>
            </Grid>
        </Box>
    );
}
