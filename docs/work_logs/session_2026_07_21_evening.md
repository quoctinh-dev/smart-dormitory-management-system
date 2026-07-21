# Work Log — Session 2026-07-21 (Evening)

## Module: `sdms-iot-gateway` — Offline RFID Whitelist Feature

**Thời gian:** 2026-07-21 21:11 → 21:16 (GMT+7)

---

## Mục tiêu
Implement tính năng **Offline Whitelist** cho ESP32-CAM: khi mất kết nối WiFi, thiết bị vẫn có thể cho phép sinh viên hợp lệ quét thẻ RFID dựa trên danh sách UID được lưu sẵn trong NVS (Non-Volatile Storage).

---

## Các file đã thay đổi / tạo mới

| File | Trạng thái | Mô tả |
|------|-----------|-------|
| `src/storage/OfflineWhitelist.cpp` | ✅ **TẠO MỚI** | Implementation đầy đủ: begin(), contains(), saveFromJson(), count(), clear(), printAll() |
| `src/storage/OfflineWhitelist.h` | ✅ **Đã có** | Không thay đổi — header đã đầy đủ |
| `src/network/HttpManager.h` | ✅ **Cập nhật** | Thêm khai báo `fetchAndSaveWhitelist()` |
| `src/network/HttpManager.cpp` | ✅ **Cập nhật** | Thêm implement `fetchAndSaveWhitelist()` — gọi GET `/rfid-whitelist?buildingId=` |
| `src/drivers/RfidDriver.cpp` | ✅ **Cập nhật** | Tách Online/Offline flow: Online → Backend verify, Offline → NVS whitelist check |
| `src/network/MqttManager.cpp` | ✅ **Cập nhật** | Xử lý lệnh MQTT `SYNC_WHITELIST` → trigger fetch ngay lập tức |
| `smart_access.ino` | ✅ **Cập nhật** | Gọi `OfflineWhitelist::begin()` trong setup(), first-sync + periodic sync (6h) trong loop() |
| `src/config/Config.h` | ✅ **Cập nhật** | Thêm hằng số `WHITELIST_SYNC_INTERVAL = 21600000UL` (6 giờ) |

---

## Kiến trúc luồng hoạt động

```
[Boot]
  setup()
    → OfflineWhitelist::begin()    ← Khởi tạo NVS, sẵn sàng offline ngay
    → WiFiManager::init()

[loop() — khi WiFi kết nối]
  → First-time sync: HttpManager::fetchAndSaveWhitelist()   ← Sync ngay lần đầu
  → Periodic sync mỗi 6h
  → MQTT: lệnh SYNC_WHITELIST → fetchAndSaveWhitelist() tức thì

[RFID quét thẻ — RfidDriver::maintain()]
  → WiFi connected?
      YES → HttpManager::verifyCard() → Backend xác thực (online)
      NO  → OfflineWhitelist::contains(uid)
               FOUND → RelayController::unlock()  (OFFLINE GRANT)
               NOT FOUND → DENIED (log ra Serial)
```

---

## Lưu ý cho kiểm thử

1. **Test Online mode:** WiFi bình thường → quét thẻ → Serial log `[RFID] [ONLINE]`
2. **Test Offline fallback:**
   - Bước 1: Đảm bảo đã sync whitelist lần đầu (Serial log `✅ Whitelist sync complete`)
   - Bước 2: Tắt WiFi router / ngắt hotspot
   - Bước 3: Quét thẻ đã nằm trong whitelist → Serial log `[RFID] [OFFLINE] ✅ UID found` + relay mở
   - Bước 4: Quét thẻ không có → Serial log `[RFID] [OFFLINE] ❌ UID not in whitelist`
3. **Test MQTT sync:** Gửi payload `{"command":"SYNC_WHITELIST"}` tới topic `sdms/gates/{gateId}/command` → Serial log `[MQTT] SYNC_WHITELIST command received`

---

## Trạng thái hiện tại
- ✅ Firmware code hoàn chỉnh và logic nhất quán
- ⚠️ Chưa compile verify (cần Arduino IDE hoặc PlatformIO)
- ⏳ Backend endpoint `GET /rfid-whitelist?buildingId=` cần được kiểm tra xem đã exist chưa

---

## Phát hiện & Fix bổ sung (cuối buổi)

### Vấn đề phát hiện khi audit Backend
Sau khi kiểm tra `IotVerificationController.java` và `SmartAccessMqttListener.java`:

| Vấn đề | Mô tả | Fix |
|--------|-------|-----|
| HTTP response format sai | Backend trả `data.data = Map<UUID, List<String>>`, ESP32 parse `data.uids` (không tồn tại) | Sửa `saveFromJson()` để iterate JsonObject building map |
| MQTT topic chưa subscribe | Backend push vào `sdms/gates/building/{UUID}/whitelist`, ESP32 không subscribe topic này | Thêm subscribe trong `subscribeTopics()` |
| MQTT payload format khác | Backend push `{"type":"WHITELIST_SYNC","data":[...]}`, ESP32 đọc `{"command":"SYNC_WHITELIST"}` | Thêm `saveFromMqttJson()` + routing trong callback |
| BUILDING_ID sai format | Config dùng `"B1"` nhưng Backend group theo UUID | Cập nhật placeholder + warning comment |

### Kiến trúc whitelist sync sau fix:
```
[Backend event: checkout / RFID assigned / đổi phòng]
  → SmartAccessMqttListener.syncWhitelistToEdge()
  → MQTT publish: topic = sdms/gates/building/<UUID>/whitelist
                 payload = {"type":"WHITELIST_SYNC","data":["UID1",...]}

[ESP32 MqttManager.callback()]
  → Detect topic = ...whitelist
  → OfflineWhitelist::saveFromMqttJson()
  → NVS updated ✅

[ESP32 - HTTP Pull fallback (mỗi 6h hoặc lệnh SYNC_WHITELIST)]
  → GET /rfid-whitelist?buildingId=<UUID>
  → Response: {success:true, data:{count:N, data:{"<uuid>":["UID1",...]}}}
  → OfflineWhitelist::saveFromJson() - iterate all buildings
  → NVS updated ✅
```

### Files cập nhật bổ sung:
- `OfflineWhitelist.cpp` — Fix `saveFromJson()` parse logic + thêm `saveFromMqttJson()`
- `OfflineWhitelist.h` — Thêm khai báo `saveFromMqttJson()`
- `MqttManager.cpp` — Subscribe whitelist topic + routing callback + OfflineWhitelist include
- `Config.h` — Fix `BUILDING_ID` từ `"B1"` → UUID placeholder + cảnh báo

---

## Module 2: Backend + Frontend — System Configs (/admin/system-configs)

### Migration tạo mới
`V63__add_missing_system_configs.sql` — Thêm 7 config keys còn thiếu:

| Config Key | Mặc định | Module |
|-----------|:---:|-------|
| `DUAL_AUTH_START` | `18:00` | Smart Access |
| `DUAL_AUTH_END` | `06:00` | Smart Access |
| `GLOBAL_CURFEW_START` | `23:00` | Smart Access |
| `GLOBAL_CURFEW_END` | `05:30` | Smart Access |
| `LATE_RETURN_DEADLINE` | `00:00` | Smart Access |
| `MIN_CHECKOUT_NOTICE_DAYS` | `7` | Checkout |
| `WATER_PRICE_PER_M3` | `15000` | Payment |

### Frontend cập nhật
`SystemConfigPage.tsx` — thêm nhận diện unit `HH:mm` cho các key dạng giờ + validate input + placeholder

### Kết quả build
- Backend: `mvn compile` ✅
- Frontend: `npm run build` ✅ (4.08s)

---

## Module 3: Frontend — Admin Smart Access Management UI

**Thời gian:** 2026-07-21 23:10 (GMT+7)

### Công việc đã thực hiện:
- Ánh xạ enum `OFFLINE_SYNC_VIOLATION` thành chữ **"Vượt rào cúp điện"** trong biến `DENIAL_REASONS_MAP`.
- Ánh xạ enum `OFFLINE_MASTER_PIN_GRANT` thành chữ **"Mở bằng mã khẩn cấp"** trong biến `DENIAL_REASONS_MAP`.
- Cập nhật UI bảng điều khiển (Bảng **Lịch sử ra vào**):
  - Hiển thị chữ màu đỏ (`error.main`) cho **"Vượt rào cúp điện"**.
  - Hiển thị chữ màu vàng (`warning.main`) cho **"Mở bằng mã khẩn cấp"**.
  - Áp dụng font-weight 600 để nhấn mạnh hai trường hợp khẩn cấp/phạt nguội trên.
- Đã chạy lệnh `npm run lint:fix` để sửa toàn bộ lỗi Prettier và chuẩn hóa code (trước đó có hơn 20k warnings/errors format của toàn bộ Frontend).
- Đã fix lỗi TypeScript `variant="body2"` không hợp lệ trên thẻ `TableCell` trong file `EligibilityManagerDialog.tsx` gây lỗi build.
- Đã fix lỗi thông báo native `alert()` không đúng chuẩn trong file `CheckoutManagement.tsx` (thay bằng `snackbar.warning`).
- Đã chạy `npm run build` thành công 100% không còn bất kỳ lỗi type nào.

---

## Module 4: Fullstack — Tính năng Lọc Lịch sử theo Lý do/Phạt nguội

**Thời gian:** 2026-07-22 00:00 (GMT+7)

### Công việc đã thực hiện:
- **Backend**:
  - Sửa đổi `AccessHistorySpecification.java` để thêm tiêu chí query (Predicate) theo `denialReason`.
  - Cập nhật REST Controller `AccessHistoryController.java` (`getAllHistory`) hỗ trợ tham số request `@RequestParam denialReason`.
  - Đã chạy `mvnw compile` thành công toàn bộ.
- **Frontend**:
  - Cập nhật interface `getAccessHistory` trong `smart-access-api.ts` để truyền param `denialReason`.
  - Cập nhật custom hook `useSmartAccess.ts` để handle dữ liệu bộ lọc.
  - Thêm mới UI Select Dropdown (Bộ lọc "Phân loại/Phạt nguội") vào trang `SmartAccessManagement.tsx`, bổ sung đầy đủ các lý do.
  - Chạy `npm run build` thành công hoàn toàn (`✓ built in 6.40s`).

---

## Module 5: Fullstack — Tính năng Khởi tạo Hóa đơn Thủ công (Penalty Bill)

**Thời gian:** 2026-07-22 00:20 (GMT+7)

### Công việc đã thực hiện:
- **Ngữ cảnh (Business Logic):** Phát triển tính năng tạo "Hóa đơn đền bù / Phạt vi phạm" trực tiếp, giúp Admin có công cụ thu phí bất thường khép kín 100% vòng đời CRUD tài chính KTX.
- **Backend**:
  - Tạo mới DTO `CreateManualBillRequest.java` với các validate chặt chẽ (`@NotNull`, `@DecimalMin`).
  - Mở rộng `BillService.java` thêm phương thức `createManualBill` liên kết trực tiếp với Sinh viên và Phòng (nếu có).
  - Khai báo endpoint `POST /api/v1/bills/manual` tại `BillController.java`.
  - Biên dịch thành công 100% bằng `./mvnw compile`.
- **Frontend**:
  - Khai báo hàm gọi Axios API `createManualBill` trong `payment-api.ts`.
  - Thiết kế UI Modal (Dialog) nhập liệu tại trang `PaymentManagement.tsx` kèm nút khởi tạo màu đỏ (`error` color) cảnh báo.
  - Tích hợp custom hook `usePaymentManagement.ts` để handle logic call API và reload danh sách tự động.
  - Biên dịch React Type-check `npm run build` thành công xuất sắc (`✓ built in 3.76s`).
