# Báo Cáo Tình Trạng Dự Án SDMS V1

## 1. Tổng Quan Dự Án

Dự án Hệ thống Quản lý Ký túc xá Thông minh (SDMS V1) đang trong giai đoạn xây dựng hệ thống backend bằng nền tảng Spring Boot. Mục tiêu của dự án là tạo ra một API server mạnh mẽ, an toàn và có khả năng mở rộng để phục vụ cho các ứng dụng client (web, mobile) trong tương lai.

Giai đoạn hiện tại đã hoàn thành xuất sắc việc xây dựng nền tảng (Foundation) và module Xác thực (Authentication), tạo tiền đề vững chắc cho việc phát triển các tính năng nghiệp vụ cốt lõi.

## 2. Tình Trạng Phát Triển Hiện Tại

- **Hoàn thành (Completed):**
  - **Lớp Nền tảng (Foundation Layer):** Toàn bộ các thành phần cốt lõi như cấu trúc cơ sở dữ liệu, quản lý cấu hình, các lớp dùng chung (common), và hạ tầng bảo mật đã được xây dựng hoàn chỉnh.
  - **Module Xác thực (Auth Module):** Tất cả các luồng chức năng liên quan đến định danh và xác thực người dùng đã hoàn thiện 100%, bao gồm đăng nhập, đăng xuất, làm mới token, thay đổi mật khẩu, và quy trình khôi phục mật khẩu an toàn.

- **Hoàn thành một phần (Partially Completed):**
  - **Module Người dùng (User), Sinh viên (Student), Đơn đăng ký (Application):** Các module này mới chỉ hoàn thành ở lớp dữ liệu (Data Layer), bao gồm việc định nghĩa Entity và Repository. Các lớp logic nghiệp vụ (Service) và giao tiếp (Controller, DTO) chưa được phát triển.

- **Chưa bắt đầu (Not Started):**
  - **Module Tích hợp IoT (IoT Module).**
  - **Tích hợp Ứng dụng Di động (Mobile App Integration).**

## 3. Tổng Quan Kiến Trúc

Kiến trúc của dự án tuân thủ chặt chẽ các nguyên tắc thiết kế phần mềm hiện đại, đảm bảo tính module hóa và dễ bảo trì:
- **Phân tách lớp (Layer Separation):** Cấu trúc 3 lớp (Controller - Service - Repository) được áp dụng triệt để, giúp tách biệt rõ ràng giữa giao tiếp, logic nghiệp vụ và truy cập dữ liệu.
- **Nguyên tắc SOLID, DRY:** Các lớp được thiết kế với trách nhiệm duy nhất, và các logic lặp lại (ví dụ: thu hồi token) được đóng gói thành các phương thức tái sử dụng.
- **Công nghệ lõi:** Spring Boot, Spring Security, Spring Data JPA, và PostgreSQL.

## 4. Tổng Quan Bảo Mật

Hệ thống được xây dựng với các tiêu chuẩn bảo mật cao:
- **Xác thực và Phân quyền:** Sử dụng JWT (JSON Web Token) với cặp Access Token (ngắn hạn) và Refresh Token (dài hạn). Mật khẩu người dùng được mã hóa an toàn bằng thuật toán BCrypt.
- **Cơ chế bảo mật nâng cao:** Triển khai cơ chế Xoay vòng Refresh Token (Token Rotation) và Chống tấn công chiếm dụng lại (Replay Attack Protection).
- **Khôi phục mật khẩu an toàn:** Quy trình reset mật khẩu được thiết kế lại hoàn toàn, sử dụng token một lần, có thời gian hết hạn, được hash trong database và chống lại kỹ thuật dò quét người dùng (user enumeration).
- **Cấu hình an toàn:** Toàn bộ các thông tin nhạy cảm (secrets, API keys, mật khẩu) được tách biệt khỏi mã nguồn và quản lý thông qua biến môi trường.

## 5. Tổng Quan Cơ Sở Dữ Liệu

- **Quản lý Schema:** Sử dụng **Flyway** để quản lý các phiên bản của schema cơ sở dữ liệu. Mọi thay đổi đều được ghi lại trong các file migration, đảm bảo tính nhất quán và an toàn khi triển khai trên các môi trường khác nhau.
- **Thiết kế Khóa:** Tất cả các bảng chính đều sử dụng `UUID` làm khóa chính, giúp tăng cường bảo mật và dễ dàng tích hợp.
- **Toàn vẹn dữ liệu:** Các ràng buộc như `UNIQUE`, `NOT NULL`, và khóa ngoại được sử dụng đầy đủ để đảm bảo dữ liệu luôn hợp lệ ở tầng database.
- **Hiệu năng:** Các cột dữ liệu được sử dụng thường xuyên trong các truy vấn tìm kiếm đã được đánh chỉ mục (index) để đảm bảo hiệu năng cao.

## 6. Ma Trận Mức Độ Hoàn Thiện Module

| Module | Trạng thái Hoàn thành | Ghi chú |
| :--- | :--- | :--- |
| **Lớp Nền tảng (Foundation)** | **100%** | Database, Config, Common, Security |
| **Module Xác thực (Auth)** | **100%** | Login, Logout, Refresh, Change/Forgot/Reset Password |
| **Module Người dùng (User)** | **90%** | Entity & Repository hoàn chỉnh. Thiếu Service/Controller. |
| **Module Sinh viên (Student)** | **20%** | Chỉ có Entity & Repository. |
| **Module Đơn đăng ký (Application)** | **20%** | Chỉ có Entity & Repository. |
| **Module Tích hợp IoT** | **0%** | Chưa bắt đầu. |
| **Tích hợp Ứng dụng Di động** | **0%** | Chưa bắt đầu. |

## 7. Nợ Kỹ Thuật (Technical Debt)

Các khoản nợ kỹ thuật hiện tại có mức độ ưu tiên thấp và không ảnh hưởng đến việc phát triển tính năng mới, nhưng cần được xem xét trong tương lai:
1.  **Gửi Email Đồng bộ (Synchronous Email Dispatch):** `EmailService` đang gọi API ngoài một cách đồng bộ. Điều này có thể làm chậm phản hồi của API nếu dịch vụ email gặp sự cố. Cần nâng cấp lên cơ chế bất đồng bộ (`@Async`).
2.  **Xử lý Ngoại lệ JWT Chung chung:** Hệ thống chưa có trình xử lý riêng cho `JwtException` ở tầng service, có thể dẫn đến lỗi `500 Internal Server Error` thay vì `401 Unauthorized` trong một số trường hợp.

## 8. Rủi Ro Đã Biết (Known Risks)

- **Phụ thuộc Dịch vụ Ngoài:** Hoạt động của các tính năng gửi email (Brevo) và lưu trữ file (Cloudinary) phụ thuộc vào sự ổn định của các nhà cung cấp dịch vụ bên thứ ba.
- **Lỗi Cấu hình Môi trường:** Do hệ thống phụ thuộc vào biến môi trường, việc cấu hình sai có thể khiến ứng dụng không khởi động được. Cần có tài liệu hướng dẫn triển khai chi tiết.

## 9. Giai Đoạn Phát Triển Tiếp Theo

Nền tảng và module xác thực đã ổn định. Giai đoạn phát triển tiếp theo sẽ tập trung vào việc xây dựng các tính năng nghiệp vụ cốt lõi.

- **Mục tiêu Sprint tiếp theo:** **Xây dựng hoàn chỉnh Module Quản lý Đơn Đăng ký (Application Module).**
- **Các nhiệm vụ chính:**
  1.  Thiết kế và triển khai các lớp DTO cho việc nộp và duyệt đơn.
  2.  Xây dựng `ApplicationService` với các logic nghiệp vụ: tạo đơn, duyệt đơn, lọc danh sách đơn.
  3.  Xây dựng `ApplicationController` với các endpoint RESTful và áp dụng phân quyền.
  4.  Tích hợp Cloudinary để xử lý upload file minh chứng.

## 10. Đánh Giá Mức Độ Sẵn Sàng

- **Nền tảng (Foundation):** **ĐÃ PHÊ DUYỆT (APPROVED)**. Kiến trúc vững chắc, sẵn sàng cho mở rộng.
- **Module Xác thực (Auth):** **ĐÃ PHÊ DUYỆT (APPROVED)**. An toàn, hoàn thiện và đạt chuẩn production.
- **Trạng thái dự án:** **Sẵn sàng cho giai đoạn phát triển tính năng nghiệp vụ.**

## 11. Kết Luận

Dự án SDMS V1 đã xây dựng thành công một nền tảng backend vững chắc, an toàn và có khả năng mở rộng. Các module nền tảng và xác thực đã hoàn thiện, đáp ứng các tiêu chuẩn cao về bảo mật và kiến trúc. Dự án đã sẵn sàng để chuyển sang giai đoạn tiếp theo, tập trung vào việc phát triển các tính năng nghiệp vụ cốt lõi để mang lại giá trị cho người dùng.
