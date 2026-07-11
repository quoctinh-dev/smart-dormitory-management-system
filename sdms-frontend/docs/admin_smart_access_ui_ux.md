# TÀI LIỆU UI/UX & QUẢN TRỊ RỦI RO: SMART ACCESS (WEB ADMIN)

> **THÔNG TIN QUẢN TRỊ (GOVERNANCE):**
> - **Cấp độ:** UI/UX Specification & Technical Implementation.
> - **Vị trí lưu trữ:** `sdms-frontend/docs/admin_smart_access_ui_ux.md` (Tuân thủ luật Strict UI/UX Separation).
> - **Chức năng:** Hướng dẫn tối ưu Giao diện Quản lý Ra vào cho Ban quản lý (Web Admin).

---

## 1. MỤC TIÊU TỐI ƯU UI/UX (DECISION SUPPORT)
Web Admin không phải là nơi để xem "nhật ký thô". Giao diện phải được thiết kế để **Hỗ trợ Ra quyết định (Decision Support)** cho nhân viên bảo vệ/quản lý.

### 1.1. Tối ưu Giao diện Bảng Lịch sử (Data Table)
1. **Phân loại Cấp độ Cảnh báo (Color-coding):**
   - Lỗi thông thường (Vàng/Warning): Bị từ chối do quá giờ giới nghiêm (`CURFEW_VIOLATION`), từ chối do sai ca (`OUTSIDE_TIME_WINDOW`). -> Bảo vệ có thể quyết định bấm "Mở cổng từ xa" nếu sinh viên có lý do chính đáng.
   - Lỗi nghiêm trọng (Đỏ/Error): Tài khoản bị đình chỉ, thẻ không hợp lệ (`UNAUTHORIZED_OR_INACTIVE`). -> Báo động đỏ, yêu cầu kiểm tra giấy tờ.
2. **Tra cứu Mục tiêu (Targeted View):**
   - Cung cấp ô Search theo `Student ID`. Khi sinh viên thắc mắc, Admin chỉ gõ ID, không phải tìm thủ công trong hàng ngàn log.

### 1.2. Tính năng Cứu trợ Khẩn cấp (Emergency Controls)
Giao diện luôn phải nổi bật 2 nút Action cấp cao nhất (Nên đặt ở góc trên cùng bên phải):
- **Remote Unlock (Mở cổng từ xa):** Dành cho trường hợp AI nhận diện lỗi, nhưng bảo vệ nhìn qua camera thấy đúng là sinh viên nội trú.
- **Emergency Override (Tác động khẩn cấp):** Dành cho hỏa hoạn (GLOBAL_UNLOCK) hoặc có bạo động/kẻ gian (GLOBAL_LOCKDOWN).

---

## 2. KỸ THUẬT CHỐNG CRASH & XỬ LÝ LỖI (ANTI-CRASH)

### 2.1. Ngăn chặn tràn bộ nhớ (DOM Overload / OOM)
- **Vấn đề:** 1.000 sinh viên x 4 lần ra vào = 4.000 logs/ngày. Trình duyệt sẽ treo nếu tải hết.
- **Giải pháp:** Bắt buộc sử dụng Server-side Pagination. `SmartAccessManagement.tsx` chỉ hiển thị `<TablePagination>` với `rowsPerPage = 10` hoặc `25`. Mỗi lần chuyển trang là 1 lần gọi API mới.

### 2.2. Kỹ thuật Null Safety (Optional Chaining)
Dữ liệu từ IoT gửi lên có thể bị mất mát (Packet loss). 
- Tuyệt đối không dùng `row.studentId.toString()` mà không kiểm tra.
- Sử dụng toán tử `?.` và `??` của TypeScript: `row.denialReason ?? 'Không có lý do'`.

### 2.3. Xử lý Mất kết nối Server (Network Failure)
- Nếu Backend bảo trì, API `getAccessHistory` sẽ văng Exception.
- Hook `useSmartAccess` bắt buộc phải đưa vào khối `try/catch`. 
- Giao diện phải bắt được state `loading = false` và mảng `history` rỗng, đồng thời hiển thị thông báo `Snackbar` màu đỏ: *"Mất kết nối đến máy chủ. Vui lòng kiểm tra mạng"*, thay vì hiện trang trắng (White Screen of Death).

---
*Tài liệu này được tuân thủ nghiêm ngặt theo các luật: MANDATORY SELF-VERIFICATION RULE và DOCUMENT PLACEMENT RULE của dự án SDMS.*
