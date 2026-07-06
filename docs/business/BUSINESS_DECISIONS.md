# BUSINESS DECISIONS

## Purpose
Ghi nhận các quyết định kiến trúc và nghiệp vụ mang tính lịch sử (Architecture/Business Decision Records - ADRs), giải thích TẠI SAO.

## Scope
Các quyết định lớn ảnh hưởng đến hướng đi của sản phẩm, cấu trúc DB hoặc hạ tầng.

## Source of Truth
Bằng chứng thiết kế trong mã nguồn, Database, và Module dependencies.

## Contents

### BD-001: Chạy AI nhận diện khuôn mặt trên Backend
*   **Decision:** Thuật toán AI trích xuất Vector khuôn mặt chạy trên Python Server. Spring Boot làm Orchestrator. Lưu dữ liệu dạng Vector (`pgvector`). ESP32 chỉ đẩy ảnh.
*   **Reason:** ESP32-CAM không đủ RAM và sức mạnh tính toán để chạy mô hình AI phức tạp tại biên (Edge) nhanh và chính xác. Backend gánh tải giúp dễ dàng bảo trì và nâng cấp Model AI mà không phải Flash lại firmware hàng ngàn mạch ESP32.
*   **Impact:** Giảm rủi ro phần cứng, tăng tải cho Server.
*   **Evidence:** Module `face` kết nối REST với AI Server, Migration `V22_01__enable_vector_extension.sql`.
*   **Status:** Accepted.

### BD-002: Tách biệt Hóa đơn (Bill) và Giao dịch (Payment)
*   **Decision:** Lưu `Bill` và `Payment` thành hai bảng riêng biệt theo quan hệ 1-N thay vì một bảng chung.
*   **Reason:** Một Hóa đơn có thể có nhiều nỗ lực thanh toán (Thanh toán lỗi mạng, mã QR hết hạn). Tách riêng giúp truy vết lịch sử thanh toán mà không làm thay đổi trạng thái và số tiền gốc của hóa đơn.
*   **Impact:** Kế toán dễ đối soát, hỗ trợ luồng Webhook chính xác.
*   **Evidence:** Entity `Bill`, `Payment`, Enum `PaymentStatus`.
*   **Status:** Accepted.

### BD-003: Giới nghiêm (Curfew) cấu hình theo Tòa nhà
*   **Decision:** Liên kết các chính sách `CurfewPolicy` và `TimeWindowPolicy` với `building_id` thay vì từng cổng.
*   **Reason:** Giả định trong giai đoạn đầu dự án, mọi cổng trong một tòa nhà sẽ tuân theo cùng một khung giờ hoạt động để tối giản Database.
*   **Impact:** Gây ra Business Gap nếu thực tế yêu cầu cổng phụ đóng sớm hơn cổng chính.
*   **Evidence:** Bảng `curfew_policies` có cột `building_id`.
*   **Status:** Deprecated (Cần được cải tiến trong tương lai bằng Rule).

### BD-004: Sử dụng Cloudinary quản lý file Upload
*   **Decision:** Mọi dữ liệu hình ảnh (Khuôn mặt, Bằng chứng thanh toán, Báo cáo sự cố) đều được upload trực tiếp qua Cloudinary thay vì lưu trên local server.
*   **Reason:** Tối ưu hóa băng thông, tránh phình to dung lượng ổ cứng Server. Tận dụng CDN của Cloudinary để tải ảnh nhanh hơn.
*   **Impact:** Phụ thuộc vào dịch vụ bên thứ ba (Cloudinary API).
*   **Evidence:** Module `upload`, class `CloudinaryService`.
*   **Status:** Accepted.

### BD-005: Sáp nhập module `utility` vào `payment`
*   **Decision:** Xóa module `utility` độc lập. Toàn bộ logic ghi nhận điện (`ElectricityUsage`) và sinh Bill điện (`ElectricityBillListener`, `ElectricityUsageScheduler`) được chuyển vào module `payment`.
*   **Reason:** Module `utility` không có Controller riêng, phụ thuộc hoàn toàn vào `payment` để phát sinh Bill. Sáp nhập giúp giảm sự phân tán của logic tài chính và loại bỏ cross-module dependency không cần thiết.
*   **Impact:** Tất cả `ElectricityUsage`-related class nay thuộc package `com.sdms.backend.modules.payment`.
*   **Evidence:** `payment/entity/ElectricityUsage.java`, `payment/scheduler/ElectricityUsageScheduler.java`.
*   **Status:** Accepted.

### BD-006: Statically Mapped RBAC for Smart Access
*   **Decision:** Không sử dụng các bảng Database động (như `role_permissions`, `permissions`) để ánh xạ quyền hạn cho Module Smart Access. Thay vào đó, cấp phát Granular Capabilities tĩnh trực tiếp trong `UserAccount.getAuthorities()` dựa trên Enum `Role` (ADMIN, STAFF).
*   **Reason:** Hạn chế Over-engineering cho dự án Đồ án tốt nghiệp. Cơ chế phân quyền tĩnh vẫn đảm bảo Strict Governance và Module Isolation mà không tốn chi phí quản lý Database hay phát triển UI phân quyền phức tạp.
*   **Impact:** Tiết kiệm thời gian phát triển; Nhân viên (STAFF) bị giới hạn quyền truy cập (chỉ được xem lịch sử, mở khóa cổng) trong khi ADMIN có toàn quyền.
*   **Evidence:** `UserAccount.java` (`getAuthorities()` method) và `SmartAccessPermissions.java`.
*   **Status:** Accepted.

## Related Documents
- [BUSINESS_ASSUMPTIONS](./BUSINESS_ASSUMPTIONS.md)
