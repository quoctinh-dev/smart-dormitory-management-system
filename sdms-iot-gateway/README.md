# 🚀 Smart Dormitory Access Control System - IoT Module

Đây là **IoT Subsystem Implementation Repository** thuộc Monorepo **SDMS**.

## 📌 Hướng dẫn Tiếp cận
Tài liệu định hướng chi tiết cho việc phát triển và cấu hình thiết bị nằm trong thư mục `docs/`.
👉 **Vui lòng đọc [docs/README.md](docs/README.md) đầu tiên khi làm việc với phân hệ này.**

## 🏗️ Vai trò của IoT Module
- **Quan hệ với Backend:** IoT là Edge Device, gửi dữ liệu thô (Ảnh, Mã thẻ) và nhận lệnh điều khiển. Backend là bộ não quyết định đóng/mở.
- **Quan hệ với Frontend / Android App:** Không có kết nối trực tiếp từ App đến IoT. Frontend/App tương tác với Backend, Backend gửi lệnh xuống IoT qua MQTT.
- **Quan hệ với Python AI:** IoT gửi ảnh về Backend, Backend đẩy qua Python AI. IoT không giao tiếp trực tiếp với AI.
- **Vai trò của Firmware:** Chỉ tập trung vào quản lý phần cứng (Camera, RFID, Relay), ổn định kết nối mạng (WiFi, MQTT) và thực thi lệnh (Actuator).

## 📂 Cấu trúc Thư mục
```text
sdms-iot-gateway/
├── docs/                 # Tài liệu Hardware, Firmware, Integration, Reference
├── firmware_esp32/       # Nơi phát triển mã nguồn C/C++
├── diagnostics/          # Công cụ kiểm thử phần cứng
├── .agents/              # Cấu hình AI Agent Workflow
└── PROJECT_RULE.md       # Quy tắc kỹ thuật tối cao
```
