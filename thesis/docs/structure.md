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

## 2. DÀN Ý NỘI DUNG CHÍNH (TÍCH HỢP HỆ THỐNG IOT TỪ PHẦN CỨNG ĐẾN PHẦN MỀM)

**Chương 1: Giới thiệu**
*   1.1. Đặt vấn đề, mục tiêu luận văn *(Nhấn mạnh hệ thống Cyber-Physical: Web + IoT)*
*   1.2. Những thách thức cần giải quyết *(Đồng bộ dữ liệu Real-time, độ trễ phần cứng...)*
*   1.3. Nội dung, phạm vi thực hiện
*   1.4. Kết quả cần đạt *(Lập bảng kết quả chức năng phần mềm và độ ổn định phần cứng)*

**Chương 2: Phương pháp thực hiện**
*   2.1. Các hệ thống tương tự *(Đánh giá ưu/nhược điểm các hệ thống KTX hiện tại)*
*   2.2. Cơ sở lý thuyết
    *   2.2.1 Tổng quan về Internet of Things (IoT) và Giao thức MQTT.
    *   2.2.2 Kiến trúc Microservices (hoặc Monolithic) cho Backend.
*   2.3. Công nghệ sử dụng
    *   2.3.1 Công nghệ Phần mềm (Spring Boot, React...).
    *   2.3.2 Nền tảng Phần cứng (ESP32, Cảm biến, PlatformIO...).
*   2.4. Phân tích yêu cầu
    *   2.4.1 Các quy trình, nghiệp vụ *(VD: Quy trình quẹt thẻ, Quy trình cảnh báo khẩn cấp...)*
    *   2.4.2 Sơ đồ chức năng
    *   2.4.3 Sơ đồ Use case tổng quát *(Phải có Actor là "Thiết bị IoT")*

**Chương 3: Thiết kế (Trọng tâm tích hợp IoT)**
*   **3.1. Kiến trúc hệ thống tổng thể** *(Sơ đồ liên kết: Linh kiện -> Node/Gateway -> Cloud Server -> UI)*
*   **3.2. Thiết kế phần cứng (Mô hình thiết bị)**
    *   3.2.1. Lựa chọn linh kiện *(Phân tích lý do chọn ESP32, RFID RC522, Cảm biến DHT, Relay...)*
    *   3.2.2. Sơ đồ khối phần cứng *(Block Diagram mô tả dòng điện/tín hiệu giữa các linh kiện)*
    *   3.2.3. Sơ đồ nguyên lý mạch (Schematic) & Sơ đồ đi dây (Wiring).
    *   3.2.4. Mô hình thiết bị hoàn chỉnh *(Hình ảnh 3D hoặc hình chụp lắp ráp thực tế hộp thiết bị)*
*   **3.3. Mô hình dữ liệu** *(Mức ý niệm, luận lý, vật lý - Cách lưu Database cho dữ liệu Sensor)*
*   **3.4. Mô hình xử lý (Phần mềm & Firmware)**
    *   3.4.1 Use case chi tiết *(Kèm bảng mô tả các luồng nghiệp vụ Core)*
    *   3.4.2 Sơ đồ thuật toán nhúng (Flowchart) *(Mô tả logic code C++ chạy trên ESP32)*
    *   3.4.3 Sơ đồ tuần tự (Sequence Diagram) *(Mô tả luồng giao tiếp MQTT/HTTP giữa ESP32 <-> Backend)*
*   **3.5. Hệ thống màn hình** *(Thiết kế UI/UX Dashboard giám sát thiết bị)*

**Chương 4: Thử nghiệm**
*   4.1. Các kịch bản thử nghiệm *(Kịch bản test Web và test độ nhạy phần cứng)*
*   4.2. Kết quả thử nghiệm các kịch bản *(Đo độ trễ MQTT, khoảng cách nhận thẻ RFID)*
*   4.3. Xử lý các trường hợp ngoại lệ *(Edge cases: Thiết bị mất mạng Wifi, cúp điện, chập mạch...)*

**Chương 5: Kết luận**
*   5.1. Kết quả đối chiếu với mục tiêu *(Lập bảng)*
*   5.2. Các vấn đề còn tồn đọng
*   5.3. Mở rộng (hướng phát triển)

**Phụ lục**
*   Hướng dẫn sử dụng *(Cách vận hành thiết bị IoT thực tế và thao tác trên Web)*

**Tài liệu tham khảo**
*   `[1] Tác giả 1, tác giả 2 (năm xuất bản). Tên sách/tài liệu, Nơi xuất bản.`
