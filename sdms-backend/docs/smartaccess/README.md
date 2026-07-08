# MODULE SMART ACCESS (RA VÀO THÔNG MINH)

## 1. Mục đích
Thư mục này chứa đặc tả thiết kế và kiến trúc Backend của module **SmartAccess**. Đây là module có độ phức tạp cao nhất, giao thoa giữa Business Rules (Backend), AI (Nhận diện khuôn mặt) và IoT (Điều khiển cổng từ ESP32 qua MQTT).

## 2. Danh sách Tài liệu Cốt lõi
- **`SSR-SmartAccessModule.md`**: Yêu cầu chức năng tổng quan của Module. Định nghĩa các Rules cốt lõi (Kiểm tra Tư cách lưu trú, Giờ giới nghiêm, Cấp quyền).
- **`03_ACCESS_CONTROL_FLOW.md`**: Mô tả cực kỳ chi tiết Flow đánh giá 1 request (Idempotency -> Identity -> Eligibility -> Policy -> Log).
- **`04_EVENT_AND_MQTT_INTEGRATION.md`**: Bản thiết kế cách Backend và Thiết bị IoT giao tiếp với nhau (HTTP POST hướng lên, MQTT hướng xuống) và các Sự kiện Spring (Events) nội bộ.

## 3. Nhật ký Quy hoạch (Quy tắc Cross-Module)
- Tài liệu Báo cáo Audit & Lộ trình triển khai Firmware/Python AI (`00_PROJECT_PLANNING_AND_AUDIT.md`) đã được dời sang **`docs/roadmap/features/04_SMARTACCESS_IOT_INTEGRATION.md`** vì đây là Kế hoạch tương lai chung của toàn dự án.
- Toàn bộ thư mục `esp32_integration` (Chứa đặc tả phần cứng, chân cắm, firmware C++) đã bị TRỤC XUẤT khỏi Backend và dời sang đúng nhà của nó: **`sdms-iot-gateway/docs/esp32_integration/`**. Backend chỉ lưu tài liệu Backend!
- Các API endpoints cho SmartAccess đã được thiết kế và lưu tại thư mục tập trung **`docs/api/smart-access-api.md`**.
