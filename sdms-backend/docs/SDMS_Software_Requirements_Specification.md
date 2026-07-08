# Quy chế Yêu cầu Phần mềm (SSR) & Định hướng Tài liệu Backend - SDMS
**Phiên bản:** 3.0 (Bản Đã Quy hoạch theo Single Source of Truth)
**Ngày cập nhật:** 2026-07-07

## 1. Giới thiệu Tổng quan

Tài liệu này là **Master Index (Mục lục Cốt lõi)** cho toàn bộ hệ thống tài liệu của `sdms-backend`. Nó đóng vai trò định hướng để các kỹ sư và AI Agent biết cách tìm kiếm tài liệu đúng nơi, đúng chỗ theo nguyên tắc **Quy hoạch tập trung** và **Tách biệt UI/UX**.

**NGUYÊN TẮC QUẢN TRỊ TÀI LIỆU BẮT BUỘC:**
- **Code is Truth:** Nếu tài liệu nói khác với mã nguồn Java thực tế, thì mã nguồn là chân lý, và tài liệu phải được cập nhật lại.
- **Không có Frontend Logic:** Toàn bộ hướng dẫn React, giao diện, Axios, State Machine của Mobile App đã bị trục xuất sang `sdms-frontend/docs/`. Backend chỉ chứa nghiệp vụ và cấu trúc Backend.
- **API Centralization:** Bất kỳ tài liệu nào mô tả Flow gọi API, Sequence Diagram hoặc Payload HTTP đều được gom về thư mục `api/`.
- **Roadmap Global:** Các tính năng chưa được code (tương lai) phải nằm ở `docs/roadmap/` (thư mục gốc của monorepo), không được để lẫn lộn ở Backend gây nhầm lẫn.

---

## 2. Mục lục và Cấu trúc Tài liệu Backend

### PHẦN A: NỀN TẢNG KIẾN TRÚC & API (GLOBAL)
1. **[Kiến trúc Hệ thống (Architecture)](./architecture/)**
   - [Nguyên tắc Thiết kế Cốt lõi (Event-Driven, Decoupling)](./architecture/system-design-principles.md)
   - [Quy chế Vận hành Tin cậy & Xử lý Tình huống Bất ngờ](./architecture/system-reliability-design.md)
2. **[Đặc tả API & Luồng Giao tiếp (API Flow Central)](./api/)**
   - *Thư mục này chứa 100% các tài liệu về HTTP Endpoints, Webhook, Sequence Diagram API, và luồng gọi API từ Client.*
   - *(Vui lòng xem [README của thư mục API](./api/README.md) để tra cứu các luồng API Auth, Student, Registration, v.v).*

### PHẦN B: ĐẶC TẢ NGHIỆP VỤ THEO MODULE (MODULE-SPECIFIC SSR)
Mỗi module sẽ có một file `SSR-[TênModule].md` đóng vai trò định nghĩa Yêu cầu Chức năng (Functional Requirements).

1. **[Module 01: Xác thực & Phân quyền (Auth)](./auth/)**
   - [Yêu cầu Chức năng Xác thực](./auth/SSR-AuthModule.md)
2. **[Module 02: Quản lý Sinh viên (Student)](./student/)**
   - [Yêu cầu Chức năng Sinh viên](./student/SSR-StudentModule.md)
   - [Vòng đời và Quản lý Hồ sơ Sinh viên](./student/student-lifecycle.md)
3. **[Module 03: Đợt Đăng ký (Registration)](./registration/)**
   - [Yêu cầu Chức năng Đợt Đăng ký](./registration/SSR-RegistrationModule.md)
4. **[Module 04: Đơn từ Đăng ký Phòng (Application)](./application/)**
   - [Yêu cầu Chức năng Đơn từ](./application/SSR-ApplicationModule.md)
   - [Phân tích Mô hình Miền & Dữ liệu](./application/domain-model.md)
   - [Luồng Xử lý End-to-End](./application/end-to-end-workflow.md)
   - [Thiết kế Biểu mẫu (Form Design)](./application/form-design.md)
5. **[Module 05: Quản lý Phòng & Xếp giường (Room)](./room/)**
   - [Yêu cầu Chức năng Phòng](./room/SSR-RoomModule.md)
   - [Mô hình Thực thể Phòng & Tòa nhà](./room/room-entity-model.md)
6. **[Module 06: Thanh toán KTX (Payment)](./payment/)**
   - [Yêu cầu Chức năng Thanh toán](./payment/SSR-PaymentModule.md)
   - [Vòng đời Hóa đơn & Đối soát](./payment/payment-lifecycle.md)
   - [Tích hợp Cổng thanh toán (Webhook/Polling)](./payment/payment-gateway-integration.md)
7. **[Module 07: Thông báo Tự động (Notification)](./notification/)**
   - [Yêu cầu Chức năng Thông báo](./notification/SSR-NotificationModule.md)
   - [Kiến trúc Hướng Sự kiện (Event-Driven Notifications)](./notification/event-driven-architecture.md)
8. **[Module 08: Ra vào Thông minh (SmartAccess)](./smartaccess/)**
   - *Lưu ý: Thư mục này đang chuẩn bị được Audit quy hoạch.*
   - [Yêu cầu Hệ thống Cổng từ](./smartaccess/01_SYSTEM_REQUIREMENTS.md)
   - [Luồng Kiểm soát Ra vào](./smartaccess/03_ACCESS_CONTROL_FLOW.md)
   - [Tích hợp MQTT & Sự kiện IoT](./smartaccess/04_EVENT_AND_MQTT_INTEGRATION.md)

### PHẦN C: HƯỚNG DẪN DEV & VẬN HÀNH
1. **[Hướng dẫn Deploy bằng Docker](../../docs/DOCKER_GUIDE.md)**
