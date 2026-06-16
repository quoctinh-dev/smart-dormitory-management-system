import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

/**
 * AuthLayout
 * Bao bọc các trang xác thực (Login, Register...)
 * Sử dụng Container để giới hạn chiều rộng, tránh form bị kéo dài trên màn hình lớn.
 */
const AuthLayout = () => {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh", 
        bgcolor: "background.default", // Sử dụng giá trị từ theme
        p: 2 
      }}
    >
      {/* Sử dụng Container với maxWidth='xs' hoặc 'sm' để form trông chuyên nghiệp hơn */}
      <Container maxWidth="xs">
        <Outlet />
      </Container>
    </Box>
  );
};

export default AuthLayout;