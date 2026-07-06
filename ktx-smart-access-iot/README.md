# 🚀 Smart Dormitory Access Control System - IoT Module

Đây là **IoT Subsystem Implementation Repository** thuộc Monorepo **SDMS**.

## 📌 Single Source of Truth (SSOT)
**LƯU Ý QUAN TRỌNG:** Repository này **KHÔNG** chứa định nghĩa nghiệp vụ, luồng xử lý kinh doanh, hoặc đặc tả API/MQTT. 
Toàn bộ đặc tả hệ thống (Business Rule, API Contract, MQTT Contract) được quản lý tập trung tại:
👉 `sdms-backend/docs/smartaccess/`

## 🏗️ Vai trò của IoT Module
- **Quan hệ với Backend:** IoT là Edge Device, gửi dữ liệu thô (Ảnh, Mã thẻ) và nhận lệnh điều khiển. Backend là bộ não quyết định đóng/mở.
- **Quan hệ với Frontend / Android App:** Frontend/App tương tác với Backend. Backend gửi lệnh xuống IoT qua MQTT. Không có kết nối trực tiếp từ App đến IoT.
- **Quan hệ với Python AI:** IoT gửi ảnh về Backend, Backend đẩy qua Python AI, Python AI trả kết quả về Backend. IoT không giao tiếp trực tiếp với AI.
- **Vai trò của Firmware:** Chỉ tập trung vào quản lý phần cứng (Camera, RFID, Relay), tối ưu tài nguyên (RAM, CPU), ổn định kết nối mạng (WiFi, MQTT) và thực thi lệnh (Actuator).

## 📂 Cấu trúc Thư mục
```text
ktx-smart-access-iot/
├── docs/                 # Tài liệu Hardware, Firmware, Integration, Reference
├── firmware_esp32/       # Nơi phát triển mã nguồn C/C++
├── diagnostics/          # Công cụ kiểm thử phần cứng
├── .agents/              # Cấu hình AI Agent Workflow
└── PROJECT_RULE.md       # Quy tắc kỹ thuật tối cao
```
