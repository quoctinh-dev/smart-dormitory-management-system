# Tổng quan Module Quản lý Phòng
**Phiên bản:** 1.0 · **Ngày:** 2026-06-25

Tài liệu này mô tả tổng quan về chức năng, các thực thể chính và vai trò của Module Quản lý Phòng (`Room`) trong hệ thống SDMS.

---

## 1. Chức năng chính

Module `Room` là trung tâm quản lý toàn bộ cơ sở vật chất và tình trạng cư trú trong Ký túc xá (KTX). Các chức năng cốt lõi bao gồm:

*   **Quản lý Cơ sở vật chất (CRUD):** Cung cấp các API cho Admin để thực hiện các thao tác Tạo, Đọc, Cập nhật, Xóa (CRUD) đối với:
    *   **Tòa nhà (Building):** Ví dụ: Tòa A1, Tòa A2.
    *   **Tầng (Floor):** Ví dụ: Tầng 1, Tầng 2 của Tòa A1.
    *   **Phòng (Room):** Ví dụ: Phòng 101, Phòng 102 trên Tầng 1.
    *   **Giường (Bed):** Ví dụ: Giường A, Giường B trong Phòng 101.
*   **Quản lý Phân phòng (Housing Assignment):** Xử lý logic nghiệp vụ liên quan đến việc gán sinh viên vào một giường cụ thể, bao gồm:
    *   **Giữ chỗ (Reservation):** Tự động giữ một giường cho sinh viên khi đơn đăng ký của họ được duyệt.
    *   **Check-in:** Xác nhận sinh viên đã nhận phòng và chuyển trạng thái giường thành `OCCUPIED` (Đang ở).
    *   **Check-out:** Ghi nhận sinh viên đã rời đi và giải phóng giường.
*   **Theo dõi và Thống kê:** Cung cấp dữ liệu cho các bảng điều khiển (dashboards) để Admin có thể theo dõi tình trạng lấp đầy, số giường trống, và các chỉ số vận hành khác.

## 2. Các Thực thể Chính

Mô hình dữ liệu của module được xây dựng theo cấu trúc phân cấp:

1.  **`Building` (Tòa nhà):** Thực thể cấp cao nhất.
2.  **`Floor` (Tầng):** Thuộc về một `Building`.
3.  **`Room` (Phòng):** Thuộc về một `Floor`.
4.  **`Bed` (Giường):** Thuộc về một `Room`.
5.  **`StudentHousingAssignment` (Phân phòng):** Thực thể liên kết quan trọng, nối một `Student` với một `Bed` trong một khoảng thời gian nhất định. Đây là bằng chứng cho việc cư trú của sinh viên.

## 3. Tích hợp với các Module khác

Module `Room` có vai trò trung tâm và tương tác chặt chẽ với các module khác:

*   **Module `Application` (Đầu vào):**
    *   **Lắng nghe sự kiện `ApplicationApprovedEvent`:** Khi một đơn được duyệt, module `Room` sẽ nhận được thông tin và kích hoạt quy trình giữ chỗ (reservation).
*   **Module `Payment` (Điều kiện):**
    *   **Lắng nghe sự kiện `PaymentSuccessEvent`:** Khi sinh viên thanh toán thành công, module `Room` sẽ xác nhận việc giữ chỗ và cho phép sinh viên check-in.
    *   **Lắng nghe sự kiện `PaymentExpiredEvent`:** Nếu sinh viên không thanh toán đúng hạn, module `Room` sẽ hủy việc giữ chỗ và giải phóng giường.
*   **Module `Student` (Liên kết):**
    *   Thực thể `StudentHousingAssignment` liên kết trực tiếp đến một `Student` để xác định ai đang ở tại giường nào.
*   **Module `SmartAccess` (Đầu ra):**
    *   Trạng thái `OCCUPIED` của `StudentHousingAssignment` là một trong những điều kiện tiên quyết để module `SmartAccess` cho phép sinh viên ra vào cổng.

## 4. Đối chiếu với Code

*   **CRUD APIs:** Các controllers như `BuildingController`, `FloorController`, `RoomController`, `BedController` và các service tương ứng đã được triển khai đầy đủ, cung cấp các endpoint cho Admin quản lý cơ sở vật chất.
*   **Service Phân phòng:** `HousingAssignmentService` đã có các phương thức quan trọng như `reserveBed`, `cancelReservation`, `completeCheckIn`.
*   **Listeners (Lỗ hổng):** Tương tự như các module khác, các lớp `Listener` để xử lý sự kiện từ module `Application` và `Payment` (ví dụ: `RoomAllocationListener`, `PaymentResultListener`) **chưa được triển khai**. Điều này làm cho quy trình giữ chỗ và hủy chỗ tự động không hoạt động, đòi hỏi Admin phải can thiệp thủ công.
