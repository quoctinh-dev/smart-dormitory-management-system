# CẤU TRÚC VÀ THỨ TỰ ĐÓNG QUYỂN LUẬN VĂN (STRUCTURE)

Tài liệu này quy định khung sườn (Dàn ý) chính thức của cuốn Luận văn và thứ tự đóng quyển khi in ấn.

## 1. THỨ TỰ SẮP XẾP KHI ĐÓNG QUYỂN (TRANG 9)
Khi hoàn thiện và đem đi in, các trang phải được sắp xếp CHÍNH XÁC theo thứ tự sau:
1. Bìa cứng (Màu theo hệ đào tạo).
2. Tờ giấy trắng.
3. Tờ Nhiệm vụ luận văn.
4. Lời cảm ơn (Heading Size 18, Bold, UPPERCASE).
5. Mục lục nội dung.
6. Mục lục hình ảnh hoặc sơ đồ.
7. **Nội dung LVTN (Các chương từ 1 đến 5).**
8. Phụ lục (Nếu có).
9. Tài liệu tham khảo.
10. Tờ giấy trắng.
11. Bìa cứng mặt sau (cùng màu với mặt trước).

*Lưu ý cho Mục lục (Trang 10):* Chỉ số của cấp con phải thụt đầu dòng (indent) sao cho thẳng hàng với chữ của cấp cha.

## 2. DÀN Ý NỘI DUNG CHÍNH (TÍCH HỢP HỆ THỐNG IOT, WEB, MOBILE VÀ AI)

**Chương 1: Giới thiệu**
*   1.1. Đặt vấn đề, mục tiêu luận văn *(Nhấn mạnh hệ thống Cyber-Physical: Web + IoT + Mobile App + AI Face Verification)*
*   1.2. Những thách thức cần giải quyết *(Đồng bộ dữ liệu Real-time, độ trễ phần cứng, tối ưu nhận diện ảnh...)*
*   1.3. Nội dung, phạm vi thực hiện
*   1.4. Kết quả cần đạt *(Lập bảng tiêu chí đánh giá cho mỗi kết quả: Chức năng (Core: Đăng ký, IoT), Phi chức năng (Độ trễ IoT, Tốc độ AI), Bảo mật cơ sở)*

**Chương 2: Phương pháp thực hiện**
*   2.1. Các hệ thống tương tự *(Đánh giá ưu/nhược điểm các hệ thống KTX hiện tại)*
*   2.2. Công nghệ sử dụng
    *   2.2.1 Công nghệ Phần mềm (Spring Boot, React, Kotlin/Android, Python FastAPI).
    *   2.2.2 Nền tảng Phần cứng (ESP32, Cảm biến, PlatformIO...).
    *   2.2.3 Công nghệ Triển khai (Docker, Docker Compose, Nginx).
*   2.3. Phân tích yêu cầu
    *   2.3.1 Các quy trình, nghiệp vụ *(VD: Quy trình quẹt thẻ, Quy trình xác thực khuôn mặt, cảnh báo...)*
    *   2.3.2 Sơ đồ chức năng tổng thể.
    *   2.3.3 Sơ đồ Use case tổng quát *(Phải có Actor là "Thiết bị IoT", "AI Service").*

**Chương 3: Thiết kế (Trọng tâm tích hợp IoT & AI)**
*   **3.1. Kiến trúc hệ thống tổng thể (Hệ thống Phân tán)** *(Sơ đồ liên kết: Linh kiện -> Node/Gateway -> Cloud Server -> Web/Mobile UI <-> AI Service)*
*   **3.2. Thiết kế phần cứng (Mô hình thiết bị)**
    *   3.2.1. Lựa chọn linh kiện *(Phân tích lý do chọn ESP32, RFID RC522, Cảm biến DHT, Relay...)*
    *   3.2.2. Sơ đồ khối phần cứng *(Block Diagram mô tả dòng điện/tín hiệu giữa các linh kiện)*
    *   3.2.3. Sơ đồ nguyên lý mạch (Schematic) & Sơ đồ đi dây (Wiring).
    *   3.2.4. Mô hình thiết bị hoàn chỉnh *(Hình ảnh 3D hoặc hình chụp lắp ráp thực tế hộp thiết bị)*
*   **3.3. Mô hình dữ liệu** *(Mức ý niệm, luận lý, vật lý - Cách lưu Database cho dữ liệu Sensor)*
*   **3.4. Thiết kế chi tiết các luồng nghiệp vụ (Mô hình xử lý)**
    *   **3.4.1. Sơ đồ Use case chi tiết** *(Kèm bảng mô tả 100% các chức năng bao gồm cả CRUD và Nghiệp vụ lõi)*
    *   **3.4.2. Sơ đồ tuần tự (Sequence Diagram)** *(Chỉ vẽ cho các nghiệp vụ lõi và 1 CRUD đại diện)*
    *   **3.4.3. Sơ đồ hoạt động (Activity Diagram)** *(Chỉ vẽ cho các nghiệp vụ lõi và 1 CRUD đại diện)*
*   **3.5. Hệ thống màn hình (Giao diện UI/UX)**
    *   3.5.1. Web Admin (Dành cho Ban quản lý)
    *   3.5.2. Web Public (Dành cho Sinh viên)
    *   3.5.3. Mobile App Admin (Dành cho Ban quản lý)
    *   3.5.4. Mobile App Student (Dành cho Sinh viên)
*   **3.6. Hệ thống báo biểu (Báo cáo & Thống kê)** *(Các màn hình biểu đồ Dashboard, tính năng xuất file Excel/PDF cho hóa đơn điện nước, danh sách sinh viên)*

**Chương 4: Thử nghiệm (Kiểm thử hệ thống)**
*   4.1. Kịch bản kiểm thử trọng tâm (Hot spots) *(Tập trung kiểm thử luồng Đăng ký KTX và Mở cửa IoT bằng công cụ Postman / MQTT Explorer).*
*   4.2. Kết quả thử nghiệm các kịch bản *(Đo độ trễ MQTT, khoảng cách nhận thẻ RFID, thời gian phản hồi của AI Service).*
*   4.3. Xử lý các trường hợp ngoại lệ *(Edge cases: Thiết bị mất mạng Wifi, cúp điện, chập mạch, ảnh mờ/thiếu sáng...)*

**Chương 5: Kết luận**
*   5.1. Kết quả đối chiếu với mục tiêu *(Lập bảng)*
*   5.2. Các vấn đề còn tồn đọng
*   5.3. Mở rộng *(Đề xuất: Tích hợp hệ thống báo biểu/Dashboard nếu chưa làm, thanh toán VNPAY...)*

**Tài liệu tham khảo**
*   `[1] Tác giả 1, tác giả 2 (năm xuất bản). Tên sách/tài liệu, Nơi xuất bản.`

**PHỤ LỤC**
*(Phần này dùng để chứa các nội dung chi tiết, giúp giảm tải cho số trang của các chương chính)*
*   **PHỤ LỤC A: TÀI LIỆU GIAO DIỆN HỆ THỐNG CHI TIẾT** *(Chứa toàn bộ ảnh chụp màn hình các form nhập liệu, danh sách quản lý CRUD của Web và App)*
*   **PHỤ LỤC B: TẬP HỢP SƠ ĐỒ NGHIỆP VỤ MỞ RỘNG** *(Chứa các Sơ đồ Use Case chi tiết và Sơ đồ hoạt động của các tính năng phụ)*
*   **PHỤ LỤC C: TÀI LIỆU KỸ THUẬT PHẦN CỨNG IOT** *(Chứa mã nguồn cấu hình C++ ESP32 và thông số linh kiện)*
