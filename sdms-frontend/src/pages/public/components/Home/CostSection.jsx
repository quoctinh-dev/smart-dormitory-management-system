import { Box, Container, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { AttachMoney, FlashOn, ReceiptLong, LocalMall } from "@mui/icons-material";

export default function CostSection() {
    return (
        <Box sx={{ py: 10, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Grid container spacing={6} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h3" fontWeight="900" mb={3}>
                            Chi phí Lưu trú
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={4} fontSize="1.1rem" lineHeight={1.8}>
                            Trường Đại học Công nghệ Sài Gòn (STU) luôn hỗ trợ mức phí tốt nhất để tạo điều kiện sinh hoạt và học tập cho sinh viên.
                        </Typography>

                        <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <ListItem sx={{ bgcolor: '#f8fafc', borderRadius: 3, p: 2 }}>
                                <ListItemIcon><AttachMoney color="success" sx={{ fontSize: 32 }} /></ListItemIcon>
                                <ListItemText 
                                    primary={<Typography fontWeight="bold" variant="h6">Lệ phí phòng: ~ 350.000 VNĐ/tháng</Typography>} 
                                    secondary="Thu theo đợt (thường vài tháng/lần tùy thông báo). Mức giá có thể điều chỉnh nhẹ theo năm học." 
                                />
                            </ListItem>
                            <ListItem sx={{ bgcolor: '#f8fafc', borderRadius: 3, p: 2 }}>
                                <ListItemIcon><FlashOn color="warning" sx={{ fontSize: 32 }} /></ListItemIcon>
                                <ListItemText 
                                    primary={<Typography fontWeight="bold" variant="h6">Tiền điện sinh hoạt</Typography>} 
                                    secondary="Chưa bao gồm trong giá phòng. Sinh viên tự thanh toán hàng tháng dựa trên chỉ số đồng hồ điện riêng." 
                                />
                            </ListItem>
                            <ListItem sx={{ bgcolor: '#f8fafc', borderRadius: 3, p: 2 }}>
                                <ListItemIcon><ReceiptLong color="primary" sx={{ fontSize: 32 }} /></ListItemIcon>
                                <ListItemText 
                                    primary={<Typography fontWeight="bold" variant="h6">Thanh toán Trực tuyến</Typography>} 
                                    secondary="Hệ thống hỗ trợ đóng phí tự động qua cổng thanh toán VNPay tiện lợi, nhanh chóng." 
                                />
                            </ListItem>
                        </List>
                        
                        <Typography variant="body2" color="text.secondary" mt={3} fontStyle="italic">
                            * Lưu ý: Sinh viên cần tự chuẩn bị các vật dụng cá nhân khi dọn vào ở.
                        </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 0, 
                                borderRadius: 6, 
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            {/* Placeholder for a beautiful Dorm Image, using a gradient for now if image isn't available */}
                            <Box 
                                sx={{ 
                                    height: 450, 
                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography variant="h4" color="white" fontWeight="bold" sx={{ opacity: 0.8 }}>
                                    STU Dormitory
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
