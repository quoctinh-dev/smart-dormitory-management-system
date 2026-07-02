# Mô hình Phân quyền (Role & Permission)

Hệ thống quản lý ký túc xá phân định quyền truy cập rõ ràng thành 2 phân hệ chính: **Web Admin** (Ban quản lý KTX) và **App Student** (Sinh viên/Cư dân).

## 1. Danh sách Vai trò (Roles)

Hệ thống sử dụng enum Role sau đây:
- `ADMIN`: Quản trị viên hệ thống/Ban quản lý KTX. Có toàn quyền (Full Access).
- `STUDENT`: Sinh viên đăng ký ở KTX. Chỉ được thao tác với dữ liệu của chính mình (Self-Access).

## 2. Đặc tả dữ liệu User (Frontend Role-Based Access Control)
Sau khi Đăng nhập thành công, API sẽ trả về object `user` chứa thông tin vai trò. Frontend sẽ dựa vào trường `role` để bọc các Component bảo vệ bằng mô hình HOC (Higher-Order Component) hoặc React Router.

### Object User chuẩn:
```json
{
  "id": "uuid-student-5678",
  "username": "20110001",
  "email": "20110001@student.edu.vn",
  "role": "STUDENT", 
  "status": "ACTIVE"
}
```

### Cách Frontend bọc Route bảo vệ (Ví dụ React):
```jsx
// Định nghĩa RequireAdmin Wrapper
const RequireAdmin = ({ children }) => {
  const { user } = useAuth(); // Lấy từ Context/Redux
  
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
};

// Sử dụng trong Router
<Route path="/admin/dashboard" element={
  <RequireAdmin>
    <AdminDashboard />
  </RequireAdmin>
} />
```
