# F02 — Offline Access Log Sync (Đồng bộ Lịch sử Ra vào Offline)

**ID:** F02  
**Ưu tiên:** Low (Optional for thesis)  
**Phụ thuộc:** F01 — Offline Whitelist (✅ Đã hoàn thành)

---

## 1. Vision

Khi ESP32 hoạt động ở chế độ Offline (mất kết nối Local Server), mọi sự kiện
ra vào được xử lý bởi Whitelist NVS nhưng **không được ghi vào Database**.
Feature này bổ sung khả năng:

- Lưu tạm các access event vào NVS khi offline
- Tự động đồng bộ batch lên Backend khi WiFi/LAN phục hồi
- Đảm bảo `access_history` table luôn đầy đủ, không có khoảng trống

---

## 2. Business Flow

```
[Offline] RFID quét → OfflineWhitelist GRANTED
    → OfflineAccessLog::push(uid, timestamp, action)  ← lưu NVS queue
    → RelayController::unlock()

[WiFi phục hồi] WiFiManager detects reconnect
    → OfflineAccessLog::hasPending() == true
    → HttpManager::syncOfflineLogs()
    → POST /api/v1/smartaccess/offline-log-batch
    → Backend ghi vào access_history với flag: source=OFFLINE_SYNC
    → OfflineAccessLog::clear()
```

---

## 3. Known Limitation hiện tại

```cpp
// RfidDriver.cpp — OFFLINE MODE
if (OfflineWhitelist::contains(uid)) {
    RelayController::unlock();
    // ↓ CHỈ in Serial, KHÔNG lưu NVS — log bị mất khi reboot
    Serial.printf("[RFID] [OFFLINE] Access log (pending sync): UID=%s\n", uid.c_str());
}
```

---

## 4. Implementation Roadmap

### 4.1 IoT Firmware (`sdms-iot-gateway`)

**Tạo mới:** `src/storage/OfflineAccessLog.h / .cpp`
- NVS key: `sdms_alog` namespace
- Lưu dạng JSON array: `[{"uid":"A1B2","ts":1234567,"action":"OFFLINE_GRANT"}, ...]`
- Max entries: 200 (đủ cho ~24h mất mạng với tần suất thấp)
- Methods: `push()`, `hasPending()`, `getAll()`, `clear()`

**Cập nhật:** `RfidDriver.cpp`
```cpp
// Thay Serial.printf bằng:
OfflineAccessLog::push(uid, millis(), "OFFLINE_GRANT");
```

**Cập nhật:** `HttpManager.cpp` — thêm `syncOfflineLogs()`
```cpp
// POST /api/v1/smartaccess/offline-log-batch
// Body: { "deviceId": "...", "logs": [...] }
```

**Cập nhật:** `smart_access.ino` — trigger sync khi WiFi phục hồi
```cpp
// Trong loop(), sau khi WiFi kết nối lại:
static bool wasPreviouslyOffline = false;
if (wifiJustReconnected && wasPreviouslyOffline) {
    HttpManager::syncOfflineLogs();
}
```

### 4.2 Backend (`sdms-backend`)

**Tạo mới:** `POST /api/v1/smartaccess/offline-log-batch`
- Nhận batch log từ ESP32
- Ghi vào `access_history` với field `source = "OFFLINE_SYNC"`
- Idempotency: kiểm tra duplicate bằng `(deviceId, uid, timestamp)`

**Migration:** Thêm column `source VARCHAR(20) DEFAULT 'ONLINE'` vào `access_history`

---

## 5. Lý do defer

- Với kiến trúc **Local Server + UPS**, offline xảy ra cực kỳ hiếm
- Ưu tiên hoàn thiện các module core trước (Billing, Checkout, Frontend)
- Acceptable gap cho phiên bản luận văn — đã document rõ là known limitation

---

## 6. Trigger Prompt (dùng để resume sau này)

```
Implement tính năng F02 — Offline Access Log Sync cho ESP32.

Đọc file này trước: docs/roadmap/features/F02_OFFLINE_ACCESS_LOG_SYNC.md

Tóm tắt: Khi ESP32 offline, access log bị mất. Cần:
1. Tạo OfflineAccessLog.h/.cpp để lưu NVS queue
2. Cập nhật RfidDriver.cpp để push log thay vì Serial.printf
3. Thêm HttpManager::syncOfflineLogs() gọi Backend batch API
4. Backend: tạo endpoint POST /offline-log-batch + migration thêm column source

File cần sửa:
- sdms-iot-gateway/firmware_esp32/smart_access/src/storage/ (tạo mới)
- sdms-iot-gateway/firmware_esp32/smart_access/src/drivers/RfidDriver.cpp
- sdms-iot-gateway/firmware_esp32/smart_access/src/network/HttpManager.cpp/.h
- sdms-iot-gateway/firmware_esp32/smart_access/smart_access.ino
- sdms-backend: Controller + Service + Migration
```
