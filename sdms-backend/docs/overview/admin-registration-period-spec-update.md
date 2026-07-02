# Hướng dẫn Frontend: Cập nhật code Quản lý Đợt Đăng Ký (Dựa trên source hiện tại)

Do backend vừa nâng cấp cấu trúc để giải quyết bài toán "Niên khóa lưu trú" (tránh lỗi cấp phát phòng mù quáng +1 năm), API của `RegistrationPeriod` đã bổ sung thêm 2 trường:
- `stayStartDate`: Ngày bắt đầu được vào KTX.
- `stayEndDate`: Ngày hết hạn ở KTX.

Vì vậy, team Frontend cần mở project `sdms-frontend` và sửa trực tiếp vào các file code hiện tại như sau để tránh code thừa/thất thoát logic:

---

## 1. File `src/hooks/admin/useRegistrationManagerUi.js`

### 1.1. Cập nhật `INITIAL_FORM_STATE`
Dòng số 5, thêm giá trị khởi tạo cho 2 trường mới:
```javascript
const INITIAL_FORM_STATE = {
  periodName: "",
  registrationType: "OPEN_REGISTRATION",
  startDate: "",
  endDate: "",
  stayStartDate: "", // Thêm mới
  stayEndDate: "",   // Thêm mới
};
```

### 1.2. Cập nhật hàm `handleOpenEdit`
Dòng số 56, map thêm 2 trường mới từ dữ liệu `period` đổ vào `formData`:
```javascript
  const handleOpenEdit = useCallback(
    (period) => () => {
      setEditMode(true);
      setCurrentPeriodId(period.periodId);
      setFormData({
        periodName: period.periodName,
        registrationType: period.registrationType,
        startDate: period.startDate
          ? new Date(period.startDate).toISOString().slice(0, 16)
          : "",
        endDate: period.endDate
          ? new Date(period.endDate).toISOString().slice(0, 16)
          : "",
        // ---> Thêm 2 dòng này <---
        stayStartDate: period.stayStartDate
          ? new Date(period.stayStartDate).toISOString().slice(0, 16)
          : "",
        stayEndDate: period.stayEndDate
          ? new Date(period.stayEndDate).toISOString().slice(0, 16)
          : "",
      });
      setOpenDialog(true);
    },
    [],
  );
```

*(Việc submit form `adminRegistrationApi.createPeriod(formData)` và `updatePeriod` tự động gửi đi do `formData` đã được mở rộng).*

---

## 2. File `src/pages/admin/RegistrationPeriodManager.jsx`

### 2.1. Cập nhật Form hiển thị (DialogContent)
Mở Dialog `Cập nhật đợt đăng ký`, bổ sung thêm 2 input `datetime-local` dưới phần `startDate` và `endDate` (Khoảng dòng 270):

```jsx
              {/* Giữ nguyên Grid của startDate và endDate */}
              
              {/* Thêm mới 2 ô input */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Ngày bắt đầu lưu trú"
                  value={formData.stayStartDate}
                  onChange={handleFormChange("stayStartDate")}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Ngày kết thúc lưu trú"
                  value={formData.stayEndDate}
                  onChange={handleFormChange("stayEndDate")}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
```

### 2.2. Cập nhật Bảng danh sách (TableHead & TableBody)
*Tùy chọn:* Nếu team muốn Admin dễ đối soát, hãy thêm 1 cột "Hạn lưu trú" vào bảng (Khoảng dòng 107 & 149):

```jsx
// Ở TableHead thêm:
<TableCell sx={{ fontWeight: "bold" }}>Hạn lưu trú</TableCell>

// Ở TableBody (bên trong periods.map) thêm:
<TableCell>
  {new Date(row.stayStartDate).toLocaleDateString("vi-VN")} - 
  {new Date(row.stayEndDate).toLocaleDateString("vi-VN")}
</TableCell>
```

---

## 3. Web Public (Không cần sửa)
Trang nộp đơn của sinh viên hoàn toàn không bị ảnh hưởng. Sinh viên vẫn nộp đơn bình thường và không được phép can thiệp vào `stayStartDate` và `stayEndDate` (hệ thống backend sẽ tự gán ngầm theo cấu hình của Admin).
