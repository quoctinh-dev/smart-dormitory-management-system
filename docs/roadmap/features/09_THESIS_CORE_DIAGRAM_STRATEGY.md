# TÀI LIỆU ĐỊNH HƯỚNG: CHIẾN LƯỢC VẼ SƠ ĐỒ LUẬN VĂN (15 CORE FEATURES)

## 1. Tầm nhìn (Vision)
Hệ thống Smart Dormitory Management System (SDMS) là một dự án có quy mô rất lớn, bao gồm nhiều module phức tạp (Quản lý nội trú, IoT, Thanh toán, AI). Việc vẽ toàn bộ biểu đồ UML (Use case, Sequence, Activity) cho tất cả các chức năng (bao gồm cả CRUD cơ bản) là không khả thi và làm loãng giá trị học thuật của luận văn.
**Chiến lược cốt lõi:** Chỉ liệt kê toàn bộ ở mức Cây chức năng/Use Case tổng quát. Đối với phân tích chi tiết (Use Case chi tiết, Sơ đồ Tuần tự, Sơ đồ Hoạt động), chỉ tập trung vào **15 luồng nghiệp vụ phức tạp nhất, mang tính đột phá và có giá trị cao nhất**. Các chức năng CRUD (Thêm/Xóa/Sửa danh mục) sẽ dùng sơ đồ đại diện.

## 2. Danh sách 15 Luồng Nghiệp Vụ Cốt Lõi (Đề xuất)
Dưới đây là danh sách đề xuất các luồng cần ưu tiên đưa vào báo cáo phân tích chi tiết:

**Nhóm 1: Quản lý Lưu trú & Sinh viên (Core)**
1. **Đăng ký lưu trú mới (Có AI FaceID):** Sinh viên nộp đơn -> Tải ảnh khuôn mặt lên AI -> Trích xuất & lưu embedding vector -> BQL Duyệt -> Xếp phòng tự động/thủ công.
2. **Gia hạn lưu trú:** Kiểm tra điều kiện nợ cước, vi phạm -> Tự động gia hạn hoặc chờ duyệt.
3. **Chuyển phòng/Trả phòng:** Kiểm tra tài sản, tất toán công nợ trước khi cho phép rời đi.

**Nhóm 2: Tích hợp Hệ thống (AI, IoT, Thanh toán)**
4. **Điểm danh tự động qua AI Camera:** Nhận diện khuôn mặt -> Gọi API Backend -> Cập nhật trạng thái có mặt tại KTX -> Cảnh báo giờ giới nghiêm.
5. **Thanh toán tự động qua SePay Webhook:** Sinh viên chuyển khoản -> SePay gọi Webhook Backend -> Xác thực mã giao dịch -> Gạch nợ tự động -> Gửi thông báo.
6. **Điều khiển & Giám sát Cửa thông minh (IoT):** Nhận luồng MQTT từ ESP32 -> Xác định trạng thái cửa (Mở/Đóng/Kẹt) -> Cảnh báo an ninh.

**Nhóm 3: Quản lý Dịch vụ & Vận hành**
7. **Ghi chỉ số Điện/Nước hàng tháng:** Ghi nhận chỉ số mới -> Validate chỉ số cũ -> Tính toán tự động ra Hóa đơn.
8. **Quản lý sửa chữa (Báo cáo sự cố):** Sinh viên báo cáo -> Ban quản lý tiếp nhận -> Điều phối kỹ thuật viên -> Cập nhật trạng thái hoàn thành.
9. **Xử lý Vi phạm & Kỷ luật:** Ghi nhận vi phạm -> Tính điểm trừ (nếu có) -> Tích hợp cơ chế Soft Delete/Audit Log nghiêm ngặt.

**Nhóm 4: Báo cáo & Phân quyền (Advanced)**
10. **Hệ thống Phân quyền (RBAC) & Audit:** Luồng đăng nhập đa nền tảng, phân quyền chi tiết (Admin vs Quản lý KTX), ghi nhận lịch sử thao tác.
11. **Báo cáo Thống kê Doanh thu:** Trích xuất dữ liệu đa chiều (Theo tháng, theo tòa nhà, tình trạng nợ).

*(Lưu ý: Danh sách này có thể được điều chỉnh tùy theo tiến độ thực tế của đồ án)*

## 3. Lộ trình Triển khai vào Luận văn (Implementation Roadmap)
- **Bước 1 (Chương 2 - Yêu cầu):** Liệt kê toàn bộ chức năng vào Danh sách yêu cầu & Cây chức năng.
- **Bước 2 (Chương 2 - Use Case):** Vẽ Use Case tổng quát gom nhóm. Thêm câu "Do giới hạn đồ án, phần phân tích chi tiết sẽ tập trung vào các luồng nghiệp vụ phức tạp".
- **Bước 3 (Chương 2 - Phân tích chi tiết):** Sử dụng danh sách 15 luồng trên để sinh ra Sơ đồ Hoạt động (Activity Diagram) và Sơ đồ Tuần tự (Sequence Diagram).
- **Bước 4 (Chương 3 - Database):** Áp dụng quy tắc `THESIS_DEPTH_RULE.md` vào ERD (Transaction, Audit Trail, No Hard Delete).

---
## 4. Trigger Prompt (Dành cho việc thực thi trong tương lai)
Khi bạn sẵn sàng để Agent bắt đầu quá trình hỗ trợ vẽ hoặc phân tích chi tiết, hãy copy và dán đoạn prompt sau vào khung chat:

```text
Xin chào, tôi muốn tiếp tục công việc theo định hướng trong tài liệu '09_THESIS_CORE_DIAGRAM_STRATEGY.md'.
Hiện tại, hãy giúp tôi hoàn thiện "Nhóm 1: Quản lý Lưu trú & Sinh viên". 
Cụ thể, hãy giúp tôi phân tích chi tiết luồng "Đăng ký lưu trú mới (Có AI FaceID)". 
Yêu cầu:
1. Liệt kê các bước của luồng (dạng text).
2. Liệt kê các Actor tham gia.
3. Nếu có thể, hãy viết mã PlantUML cho Sơ đồ Tuần tự (Sequence Diagram) của luồng này để tôi đưa vào báo cáo.
```
