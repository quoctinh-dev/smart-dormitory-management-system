# LỘ TRÌNH THIẾT KẾ UML CHO LUẬN VĂN (SDMS)

## 1. Tầm nhìn (Vision)
Chuyển đổi toàn bộ sơ đồ chức năng và danh sách tính năng từ `FEATURE_MAP.md` thành các biểu đồ chuẩn UML chuyên sâu phục vụ trực tiếp cho báo cáo Luận văn Tốt nghiệp. Bao gồm 4 loại tài liệu chính:
- Sơ đồ Use Case chi tiết (Dạng file XML Draw.io).
- Bảng mô tả Use Case (Usecase Specifications - Dạng Markdown/Word).
- Sơ đồ Tuần tự (Sequence Diagrams - Tập trung vào 12 luồng nghiệp vụ cốt lõi).
- Sơ đồ Hoạt động (Activity Diagrams).

## 2. Quy trình Thực thi (Implementation Roadmap)

### BƯỚC 1: Hoàn thiện 10 Sơ đồ Use Case Chi tiết (XML Draw.io)
Dựa trên phân rã `<Extend Use Case>`, tạo ra 10 file XML độc lập để sinh viên dán vào Draw.io:
1. Quản lý Tài khoản & Phân quyền (Đã xong)
2. Quản lý Hồ sơ Sinh viên (Đã xong)
3. Quản lý Kiến trúc (Tòa nhà & Tầng)
4. Quản lý Phòng & Giường
5. Đăng ký Lưu trú (Đầu vào)
6. Biến động Lưu trú (Chuyển, Gia hạn, Trả phòng)
7. Quản lý Chỉ số Điện Nước
8. Hóa đơn & Thanh toán
9. Kiểm soát Vào Ra (Access Control IoT/AI)
10. Chính sách An ninh & Cấu hình

### BƯỚC 2: Viết Bảng mô tả Usecase (Usecase Specifications)
Lập bảng mô tả cho 10 cụm Use Case chính (Main UC) ở trên.
**Cấu trúc bảng mô tả chuẩn:**
- Tên Use case
- Actor
- Mô tả
- Pre-conditions
- Post-conditions (Success / Fail)
- Luồng sự kiện chính (Main Flow - Liệt kê các thao tác gọi đến Extend Use Case)
- Luồng sự kiện phụ / Ngoại lệ (Alternative Flows)

### BƯỚC 3: Vẽ Sơ đồ Tuần tự (Sequence Diagrams)
Chọn lọc 12 luồng nghiệp vụ (Business Flow) tinh túy nhất để vẽ (dạng PlantUML hoặc Mermaid), tập trung vào tương tác Frontend - Backend - Database - External Service:
1. Sơ đồ Đăng nhập & Xác thực JWT.
2. Kích hoạt tài khoản bằng mã OTP (Email).
3. Sinh viên Nộp đơn đăng ký (Gồm upload Cloudinary).
4. Admin Duyệt hồ sơ & Tự động xếp phòng (Thuật toán).
5. Check-in nhận phòng.
6. Xử lý yêu cầu Chuyển phòng (Có giải phóng giường cũ).
7. Lập hóa đơn tự động cuối tháng.
8. Thanh toán Online & Xử lý Webhook từ SePay.
9. Đăng ký Face ID (Trích xuất Vector khuôn mặt).
10. Xác thực IoT Mở cổng bằng khuôn mặt / RFID.
11. Đồng bộ dữ liệu Offline IoT.
12. Xử lý xin phép về trễ (Giới nghiêm - Curfew).

### BƯỚC 4: Vẽ Sơ đồ Hoạt động (Activity Diagrams)
Vẽ sơ đồ luồng hoạt động (Dạng flowchart) cho các trạng thái phức tạp:
- Luồng Vòng đời Hồ sơ đăng ký lưu trú.
- Luồng Vòng đời Hóa đơn thanh toán.
- Luồng Xử lý quét khuôn mặt tại cổng.

---

## 3. TRIGGER PROMPT (Dành cho Agent kế tiếp)
*Copy đoạn text dưới đây và dán vào khung chat để yêu cầu AI thực thi ngay lập tức:*

> **Prompt:**
> Đọc kỹ lộ trình tại `docs/roadmap/features/01_UML_DESIGN_FLOW.md` và `thesis/docs/FEATURE_MAP.md`.
> Hãy thực thi ngay **BƯỚC 1**: Sinh mã XML (chuẩn Draw.io) cho 8 Biểu đồ Use Case còn lại (từ số 3 đến số 10) và lưu vào `thesis/outputs/diagrams/use-case/`. Đảm bảo sử dụng cấu trúc `<Extend Use Case>` với cụm Main Usecase ở giữa như đã thống nhất. 
> Sau khi sinh xong file, hãy xác nhận để tôi kiểm tra trên Draw.io, sau đó chúng ta sẽ đi tiếp sang BƯỚC 2 (Bảng mô tả).
