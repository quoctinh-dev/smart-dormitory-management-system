# 🏛️ SDMS IOT MODULE - FIRMWARE CONSTITUTION
**Tài liệu Quy tắc Kỹ thuật Tối cao (PROJECT_RULE.md)**

## 1. KIẾN TRÚC FIRMWARE
- **Clean Architecture & SOLID:** Tách biệt rõ ràng Hardware Drivers, Network, Core Application.

## 2. BUSINESS FREEZE POLICY & SINGLE SOURCE OF TRUTH
- **No Duplicate Documentation:** TUYỆT ĐỐI không sao chép lại API, JSON, MQTT Topic vào tài liệu của IoT.
- **Reference First:** Mọi nghiệp vụ phải Reference về `sdms-backend/docs/smartaccess/`.

## 3. INTEGRATION CONTRACTS
- **Backend Contract First:** Firmware CHỈ là thiết bị thu thập dữ liệu (Edge Device) và nhận lệnh điều khiển.
- **MQTT Contract First:** Tuân thủ 100% tài liệu Backend.
- **No Mock & No Hardcode:** Không tự sinh Mock API. Không Hardcode cấu hình mạng.

## 4. HARDWARE RULES
- **Diagnostics First:** Phải chạy tool Diagnostics trước khi code app.
- **Configuration First:** Mọi cấu hình Pinout, WiFi, Server IP phải tách biệt.
