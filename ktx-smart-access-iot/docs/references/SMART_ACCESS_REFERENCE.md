# SMART ACCESS REFERENCE MAPPING

Tài liệu này ánh xạ toàn bộ các chức năng và thiết kế của IoT Firmware đến Single Source of Truth (SSOT) tại thư mục `sdms-backend/docs/smartaccess/`. 
IoT Repository KHÔNG lưu trữ lại các thiết kế này để tránh rác kỹ thuật và bất đồng bộ (Duplicate Documentation).

## 1. Hardware & Firmware Specifications (Dành cho Lập trình viên C++)
- **Hardware Pinout Design (Sơ đồ chân IO)**: See `sdms-backend/docs/smartaccess/esp32_integration/01_hardware_pinout_design.md`
- **Firmware Architecture (Kiến trúc Phần mềm nhúng)**: See `sdms-backend/docs/smartaccess/esp32_integration/02_firmware_architecture.md`
- **Offline Mode Strategy (Xử lý rớt mạng)**: See `sdms-backend/docs/smartaccess/esp32_integration/04_offline_mode_strategy.md`

## 2. Integration Contracts (Giao thức Giao tiếp)
- **ESP32 & Backend Overall Spec**: See `sdms-backend/docs/smartaccess/esp32_integration/07_ESP32_INTEGRATION_SPECIFICATION.md`
- **API Spec (Python & Spring Boot)**: See `sdms-backend/docs/smartaccess/esp32_integration/03_api_integration_spec.md`
- **MQTT Audit & Payload Design**: See `sdms-backend/docs/smartaccess/esp32_integration/06_MQTT_INTEGRATION_AUDIT.md`
- **Event & MQTT Backend Integration**: See `sdms-backend/docs/smartaccess/04_EVENT_AND_MQTT_INTEGRATION.md`

## 3. Business Workflows & Architecture (Nghiệp vụ cốt lõi)
- **Access Control Flow (Luồng ra vào)**: See `sdms-backend/docs/smartaccess/03_ACCESS_CONTROL_FLOW.md`
- **System Requirements (Yêu cầu hệ thống)**: See `sdms-backend/docs/smartaccess/01_SYSTEM_REQUIREMENTS.md`
- **Architecture Roadmap**: See `sdms-backend/docs/smartaccess/02_ARCHITECTURE_ROADMAP.md`
- **Backend Audit Report**: See `sdms-backend/docs/smartaccess/05_AUDIT_REPORT.md`

## 4. Testing & Development Guides (Kiểm thử)
- **Integration Test Plan**: See `sdms-backend/docs/smartaccess/06_INTEGRATION_TEST_PLAN.md`
- **Prompt for Firmware Dev (Hướng dẫn AI CODE C++)**: See `sdms-backend/docs/smartaccess/esp32_integration/05_AI_PROMPT_FOR_FIRMWARE_DEV.md`
- **Prompt for Testing (Giả lập IoT)**: See `sdms-backend/docs/smartaccess/esp32_integration/08_PROMPT_FOR_TESTING.md`
