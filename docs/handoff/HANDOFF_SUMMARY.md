# BẢN GIAO CA (HANDOFF SUMMARY) - SDMS PROJECT
**Thời gian cập nhật:** 2026-07-24
**Trạng thái:** Tạm nghỉ

## 1. TÌNH TRẠNG HIỆN TẠI (CURRENT STATE)
- **Frontend & Backend (Phân quyền):** Đã hoàn tất rà soát và fix triệt để phân quyền (RBAC) giữa ADMIN và STAFF đối với phân hệ Quản lý Phòng/Giường. STAFF hiện tại chỉ có thể đổi trạng thái (Bảo trì/Mở lại) và cấp mới mã PIN. Các nút xóa, sửa, sinh tự động đã bị ẩn/chặn hoàn toàn trên cả UI (`RoomActionMenu.tsx`, `BedDetailDrawer.tsx`) và API (`RoomController`, `BedController`).
- **Feature Map:** File `thesis/docs/FEATURE_MAP.md` đã được update cực kỳ chính xác (khớp 100% với Code) làm nền tảng cho việc sinh UML.
- **Sơ đồ UML (Use Case):** 
  - Đã thống nhất phương án chia hệ thống thành **10 biểu đồ Use Case chi tiết** (Dựa trên cấu trúc `<Extend>`).
  - Đã sinh xong **2 file XML** mẫu cho Phân hệ 1 (Tài khoản & Sinh viên) tại thư mục `thesis/outputs/diagrams/use-case/`.
- **Roadmap:** Đã tạo file `docs/roadmap/features/01_UML_DESIGN_FLOW.md` lưu lại toàn bộ chiến lược vẽ Usecase, lập Bảng mô tả, và danh sách 12 Sơ đồ Tuần tự "ăn tiền" nhất.

## 2. TIẾN ĐỘ ĐÃ ĐẠT ĐƯỢC KỂ TỪ CA TRƯỚC
- [x] Sửa lỗi quyền hạn giao diện cho STAFF.
- [x] Khớp nối tài liệu `FEATURE_MAP.md` với code thực tế.
- [x] Lập chiến lược bóc tách Sơ đồ chức năng thành 10 Sơ đồ Use case.
- [x] Viết file Roadmap định hướng vẽ UML.

## 3. NHIỆM VỤ TIẾP THEO (NEXT TASKS CHO AGENT MỚI)
Khi User quay lại, Agent tiếp theo cần thực thi:
1. Đọc file `docs/roadmap/features/01_UML_DESIGN_FLOW.md`.
2. Yêu cầu User kiểm tra 2 file `uc_01_account.xml` và `uc_02_student.xml` (trong `thesis/outputs/diagrams/use-case/`) trên Draw.io xem đã ưng ý bố cục chưa.
3. Nếu User đồng ý, kích hoạt **BƯỚC 1** trong Roadmap: Chạy script hoặc sinh nốt 8 file XML còn lại cho các biểu đồ Use case từ số 3 đến số 10.
4. Chuyển sang lập Bảng mô tả Usecase (Usecase Specifications) và vẽ Sơ đồ Tuần tự (Sequence Diagrams) theo danh sách đã chốt.
