# SMART ACCESS REFERENCE MAPPING

Tài liệu này ánh xạ các tài liệu nội bộ của Firmware IoT tới các tài liệu tương ứng tại Backend (Single Source of Truth - SSOT).
Để tránh tình trạng Duplicate Documentation, phân hệ IoT tuyệt đối không mô tả lại luồng Business hay API của Backend, mà chỉ dẫn link trực tiếp.

## 1. Hardware & Firmware Specifications (Nội bộ IoT)
Các tài liệu này nằm ngay trong thư mục `sdms-iot-gateway/docs`:
- **Hardware Pinout Design (Sơ đồ chân IO)**: Xem [`../hardware/HARDWARE_PINOUT.md`](../hardware/HARDWARE_PINOUT.md)
- **Kịch bản Kiểm thử End-to-End**: Xem [`../SDMS_INTEGRATION_TEST_GUIDE.md`](../SDMS_INTEGRATION_TEST_GUIDE.md)

## 2. Integration Contracts (Giao thức Giao tiếp IoT <-> Backend)
- **Đặc tả HTTP & MQTT Payload (ESP32 Focus)**: Xem [`../ESP32_INTEGRATION_SPECIFICATION.md`](../ESP32_INTEGRATION_SPECIFICATION.md)
- **API Spec Tổng quát**: Xem tại thư mục Root: [`../../../sdms-backend/docs/api/smart-access-api.md`](../../../sdms-backend/docs/api/smart-access-api.md)
- **Kiến trúc MQTT (Backend Focus)**: Xem tại [`../../../sdms-backend/docs/smartaccess/04_EVENT_AND_MQTT_INTEGRATION.md`](../../../sdms-backend/docs/smartaccess/04_EVENT_AND_MQTT_INTEGRATION.md)

## 3. Business Workflows (Nghiệp vụ cốt lõi)
Tất cả Logic nghiệp vụ về Cấm túc, Ra vào, Idempotency đều do Backend quyết định. IoT Developer BẮT BUỘC đọc các tài liệu sau để hiểu tại sao lệnh UNLOCK được trả về:
- **Access Control Flow (Luồng xử lý)**: Xem [`../../../sdms-backend/docs/smartaccess/03_ACCESS_CONTROL_FLOW.md`](../../../sdms-backend/docs/smartaccess/03_ACCESS_CONTROL_FLOW.md)
- **System Requirements (SSR)**: Xem [`../../../sdms-backend/docs/smartaccess/SSR-SmartAccessModule.md`](../../../sdms-backend/docs/smartaccess/SSR-SmartAccessModule.md)
