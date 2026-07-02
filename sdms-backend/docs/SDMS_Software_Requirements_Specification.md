# Quy chế Yêu cầu Phần mềm (SSR) - Hệ thống Quản lý Ký túc xá Thông minh (SDMS)
**Phiên bản:** 2.0 (Bản hoàn thiện để bảo vệ)
**Ngày:** 2026-06-26

## 1. Giới thiệu Tổng quan

Tài liệu này là Quy chế Yêu cầu Phần mềm (Software Requirements Specification - SSR) chính thức cho dự án "Hệ thống Quản lý Ký túc xá Thông minh (SDMS)". Mục tiêu của tài liệu là định nghĩa một cách đầy đủ, rõ ràng và nhất quán toàn bộ các yêu cầu về nghiệp vụ, chức năng, phi chức năng, và các quyết định kiến trúc của hệ thống.

Đây là tài liệu trung tâm, đóng vai trò là nguồn tham chiếu duy nhất và chính xác nhất (Single Source of Truth) cho cả đội ngũ phát triển và các bên liên quan, bao gồm cả Hội đồng Phản biện Đồ án Tốt nghiệp.

## 2. Mục lục và Cấu trúc Tài liệu

Hệ thống tài liệu được tổ chức theo cấu trúc module, được liên kết chặt chẽ với nhau bắt đầu từ các nguyên tắc thiết kế cốt lõi.

### PHẦN A: NỀN TẢNG VÀ KIẾN TRÚC

1.  **[Các Nguyên tắc Thiết kế Cốt lõi](./overview/system-design-principles.md)**
    *   *Mô tả các quyết định kiến trúc nền tảng (Event-Driven, Idempotency, Decoupling) và lý do lựa chọn chúng.*
2.  **[Quy chế Vận hành Tin cậy & Xử lý Tình huống Bất ngờ](./overview/reliability-and-edge-cases.md)**
    *   *Mô tả các giải pháp cho các kịch bản thực tế (mất mạng, lỗi dịch vụ, xung đột dữ liệu) để đảm bảo hệ thống hoạt động ổn định.*
3.  **[Luồng Nghiệp vụ Tổng thể](./overview/business-flow.md)**
    *   *Mô tả hành trình end-to-end của các tác nhân chính (Sinh viên, Admin).*
4.  **[Ma trận và Quy tắc Nghiệp vụ](./overview/)**
    *   [Các Quy tắc Cam kết Nội trú](./overview/commitment-rules.md)
    *   [Ma trận Tính điểm Ưu tiên](./overview/priority-matrix.md)

### PHẦN B: PHÂN TÍCH NGHIỆP VỤ CHI TIẾT TỪNG MODULE

1.  **[Module 01: Xác thực & Phân quyền (Auth)](./auth/)**
    *   [Tổng quan Module](./auth/auth-overview.md)
    *   [Luồng Kích hoạt Tài khoản](./auth/activation-flow.md)
    *   [Mô hình Vai trò và Phân quyền](./auth/role-permission-model.md)
2.  **[Module 02: Quản lý Sinh viên (Student)](./student/)**
    *   [Vòng đời và Quản lý Hồ sơ Sinh viên](./student/student-lifecycle.md)
    *   [Luồng Đăng ký và Duyệt Khuôn mặt](./student/face-registration-flow.md)
3.  **[Module 03: Quản lý Đợt Đăng ký (Registration)](./registration/)**
    *   [Thiết kế và Quản lý Đợt Đăng ký](./registration/registration-period-design.md)
4.  **[Module 04: Quản lý Đơn từ (Application)](./application/)**
    *   [Thiết kế Biểu mẫu và Dữ liệu](./application/form-design.md)
    *   [Phân tích Mô hình Miền](./application/domain-model.md)
    *   [Luồng Xử lý End-to-End](./application/end-to-end-workflow.md)
5.  **[Module 05: Quản lý Phòng (Room)](./room/)**
    *   [Tổng quan Module](./room/room-overview.md)
    *   [Phân tích Mô hình Thực thể](./room/room-entity-model.md)
6.  **[Module 06: Quản lý Thanh toán (Payment)](./payment/)**
    *   [Vòng đời Hóa đơn và Giao dịch](./payment/payment-lifecycle.md)
    *   [Tích hợp Cổng thanh toán qua Webhook](./payment/payment-gateway-integration.md)
7.  **[Module 07: Ra vào Thông minh (SmartAccess)](./smartaccess/)**
    *   [Luồng Hoạt động và Logic Kiểm soát Ra vào](./smartaccess/access-control-flow.md)
    *   [Tích hợp Thiết bị IoT và Xử lý Sự kiện](./smartaccess/event-and-device-integration.md)
8.  **[Module 08: Thông báo (Notification)](./notification/)**
    *   [Chức năng và Hoạt động của Module](./notification/notification-functionality.md)

### PHẦN C: PHỤ LỤC

1.  **[Mô hình Dữ liệu Tổng thể (Master SQL Schema)](../database/db.sql)**
    *   *File SQL tổng hợp toàn bộ cấu trúc cơ sở dữ liệu của dự án.*
