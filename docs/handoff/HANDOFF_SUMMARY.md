# Handoff Summary

## Current State

### Module hoàn thành trong phiên này: IoT — Offline RFID Whitelist
- **Offline Whitelist (`sdms-iot-gateway`)**: Đã implement đầy đủ
  - `OfflineWhitelist.cpp/.h` — NVS storage với Preferences library
  - `HttpManager` — thêm `fetchAndSaveWhitelist()` (HTTP pull) + `saveFromMqttJson()` (MQTT push)
  - `MqttManager` — subscribe topic `sdms/gates/building/{UUID}/whitelist`, routing callback
  - `RfidDriver` — Online/Offline split flow
  - `smart_access.ino` — begin() + first-sync + periodic sync 6h
  - `Config.h` — thêm `WHITELIST_SYNC_INTERVAL`, fix `BUILDING_ID` → UUID format

- **Backend audit**: Endpoint `GET /rfid-whitelist` đã tồn tại và hoạt động đúng

### Kiến trúc deployment được thống nhất
- **Local Server + UPS** (khuyến nghị cho deployment thực tế)
- ESP32 chỉ cần kết nối LAN nội bộ → không phụ thuộc internet
- Web/Mobile App deploy cloud → truy cập qua internet về Local Server

### Feature defer sang Roadmap
- `docs/roadmap/features/F02_OFFLINE_ACCESS_LOG_SYNC.md` — Đồng bộ log offline lên Backend

## ⚠️ Việc cần làm trước khi flash ESP32
Chạy query để lấy UUID thật của tòa nhà, điền vào `Config.h`:
```sql
SELECT building_id, building_name FROM buildings;
```
Sau đó cập nhật `BUILDING_ID` và `GATE_ID` trong `src/config/Config.h`.

## Next Tasks
- Tiếp tục các module còn lại theo kế hoạch luận văn
- Có thể resume Penalty Bill (Hóa đơn đền bù tài sản) — đã plan trước đó
- Hoặc tạo tài liệu kiến trúc deployment (Network Topology) cho chương luận văn
