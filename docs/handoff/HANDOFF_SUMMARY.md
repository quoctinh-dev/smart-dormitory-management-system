# Handoff Summary

## Current State

### Các Module và Task hoàn thành trong phiên làm việc tối nay:
1. **IoT Firmware (ESP32)**:
   - Implement toàn bộ logic `OfflineWhitelist.cpp/.h` bằng NVS Storage.
   - Thêm luồng pull HTTP 6 tiếng/lần và push MQTT real-time cho danh sách thẻ.
   - Tách luồng kiểm duyệt thẻ (Online calls Backend, Offline kiểm tra NVS cục bộ).
   - Đã biên soạn tài liệu E2E Testing tại `sdms-iot-gateway/docs/E2E_OFFLINE_SYNC_TESTING.md`.

2. **Frontend & Backend (Nợ kỹ thuật & UI/UX)**:
   - **Performance:** Áp dụng `React.lazy()` và `Suspense` cắt nhỏ chunk size (< 500kB).
   - **UI Báo cáo:** Cập nhật bảng "Lịch sử ra/vào" trên Web Admin. Ánh xạ biến `OFFLINE_SYNC_VIOLATION` thành chữ "Vượt rào cúp điện" (màu đỏ) và `OFFLINE_MASTER_PIN_GRANT` thành "Mở bằng mã khẩn cấp" (màu vàng).
   - **Bug Fix:** Xóa bỏ popup `alert()` native thô thiển trong `CheckoutManagement.tsx` và thay bằng `snackbar.warning`.
   - **Feature Mới (Access):** Thêm bộ lọc nhiều tiêu chí "Phân loại/Phạt nguội" (Dropdown) vào Frontend, truyền biến `denialReason` qua REST Controller API tới JPA Specification.
   - **Feature Mới (Finance):** Hoàn thành trọn vẹn Luồng Tạo hóa đơn thủ công (Penalty Bill). Cập nhật Backend REST API `POST /bills/manual`, UI Dialog, Hook và API Client. Khép kín vòng đời 100% CRUD tài chính.
   - **Self-verification:** Đã chạy auto fix lint >20k lỗi. Đã chạy `./mvnw compile` và `npm run build` thành công hoàn toàn 100%.

## ⚠️ Việc cần làm trước khi flash ESP32
Chạy query lấy UUID thật của tòa nhà:
```sql
SELECT building_id, building_name FROM buildings;
```
Sau đó thay UUID đó vào biến `BUILDING_ID` trong file `src/config/Config.h`.

## 🎯 Kế Hoạch Cho Ngày Mai (Next Session)
Người dùng yêu cầu tập trung hoàn thiện 2 việc cốt lõi sau:
1. **Hoàn thành IoT:** Dùng IDE (PlatformIO/Arduino) để Compile, Flash code, và setup trực tiếp để test luồng Offline / Whitelist thực tế dựa trên tài liệu E2E vừa tạo. Đảm bảo mạch IoT chạy hoàn hảo 100%.
2. **Viết báo cáo Khóa luận:** Dựa vào các luồng đã hoàn thiện (Online/Offline, Hàng đợi duyệt đơn, Thanh toán, Phạt vi phạm, Tối ưu hóa UI/UX, Component Tree,...), tiến hành lên dàn ý và viết chi tiết báo cáo luận văn. Chú trọng phần kiến trúc Monorepo, xử lý ngoại lệ (offline sync) và tối ưu hóa hệ thống.
