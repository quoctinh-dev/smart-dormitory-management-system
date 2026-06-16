import { Box, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAuth } from "@/auth";

/**
 * StatCard component
 * Tối ưu: Dùng sx với theme palette để lấy màu tự động
 */
const StatCard = ({ title, value, color }) => (
    <Paper 
        sx={{ 
            p: 3, 
            borderRadius: 3, 
            borderLeft: '6px solid',
            borderColor: color // MUI tự động map màu từ palette nếu truyền đúng key
        }}
    >
        <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color: color }}>
                {value}
            </Typography>
        </Stack>
    </Paper>
);

export default function AdminDashboard() {
    const { admin } = useAuth();

    const stats = [
        { title: "Hồ sơ đăng ký", value: "0", color: "primary.main" },
        { title: "Sinh viên", value: "0", color: "secondary.main" },
        { title: "Phòng còn trống", value: "0", color: "success.main" },
    ];

    return (
        <Box>
            {/* PAGE TITLE */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight={800}>Dashboard</Typography>
                <Typography color="text.secondary" mt={0.5}>
                    Xin chào, {admin?.fullName || "Quản trị viên"}! Chúc một ngày làm việc hiệu quả.
                </Typography>
            </Box>

            {/* STATS GRID */}
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}