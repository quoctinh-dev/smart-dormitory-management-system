#ifndef PINS_H
#define PINS_H

// ==============================================================================
// SƠ ĐỒ CHÂN (PIN MAPPING) — AI-THINKER ESP32-CAM (4MB Flash + 4MB PSRAM)
// Đã kiểm thử phần cứng: 2026-07-11
//
// CÁC CHÂN ĐƯỢC BẢO LƯU VĨNH VIỄN — KHÔNG BAO GIỜ DÙNG LÀM GPIO:
//
//   GPIO 16 — PSRAM CS (được hàn chết vào chân chọn chip PSRAM trên bo mạch).
//              Nếu cấu hình lại chân này sẽ làm vô hiệu hóa PSRAM và gây ra lỗi
//              assert failed: block_locate_free (sập nguồn bộ nhớ TLSF heap).
//
//   GPIO  0 — Chân Strapping / Chế độ Boot.
//              Bắt buộc phải ở mức CAO (HIGH) khi khởi động bình thường. LOW = Chế độ nạp Flash.
//
//   GPIO  4 — Đèn LED Flash (dùng chung với chân SD card DATA1 / HS2_DATA1).
//              Chân này điều khiển đèn LED trắng công suất cao thông qua transistor Q1.
//              Khi ở mức HIGH, đèn LED sẽ sáng.
//              Trong firmware, ta luôn giữ chân này ở mức LOW. KHÔNG ĐƯỢC nối chân RST
//              của RC522 vào đây — nếu không đèn LED sẽ sáng chói liên tục.
//              Tuyệt đối KHÔNG dùng GPIO 4 cho bất kỳ thiết bị ngoại vi nào.
//
//   GPIO 12 — Chân Strapping (Chọn điện áp Flash: 3.3V hay 1.8V).
//              Bắt buộc phải ở mức THẤP (LOW) khi bật nguồn/reset. Nếu bị kéo lên HIGH lúc boot,
//              ESP32 sẽ chọn nguồn 1.8V cho flash → gây lỗi boot "flash read err".
//              Chân này an toàn để sử dụng SAU KHI khởi động xong, miễn là thiết bị gắn vào
//              không tự ý kéo nó lên mức HIGH lúc bật điện.
//              Tín hiệu PWM của Servo là 0V (LOW) lúc nghỉ — nên dùng chân 12 cho Servo là an toàn.
//
// Tài liệu tham khảo:
//   - AI Thinker ESP32-CAM schematic v1.0
//   - Espressif ESP32 datasheet (Strapping Pins: GPIO0, GPIO2, GPIO5, GPIO12, GPIO15)
//   - MFRC522 datasheet rev 3.9
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. SERVO (Động cơ chốt cửa quay liên tục 360 độ)
//    Sử dụng GPIO12 — là chân strapping nhưng AN TOÀN cho servo vì:
//      • Dây tín hiệu Servo là 0V (LOW) lúc mới bật nguồn (chưa gắn biến).
//      • Xung PWM chỉ kích hoạt sau khi hàm setup() chạy xong — tức là sau khi
//        chip đã đọc xong trạng thái strapping.
//      • TUYỆT ĐỐI KHÔNG gắn thêm điện trở kéo lên (pull-up) vào dây này.
// ------------------------------------------------------------------------------
#define SERVO_PIN         12

// ------------------------------------------------------------------------------
// 2. RFID RC522 (Sử dụng bus HSPI)
//    KHÔNG ĐƯỢC gắn thẻ nhớ MicroSD — khe cắm thẻ SD dùng chung các chân 12/13/14/15/2.
//
//    Chân RST ban đầu nối vào GPIO 2 (chân an toàn, không gây xung đột sau khi boot).
//    Chân MOSI đổi sang GPIO 13 để tránh xung đột strapping của GPIO2 lúc khởi động.
//
//    Quyết định chốt sơ đồ chân cuối cùng:
//      SDA/SS  → GPIO 14   (an toàn, không phải chân strapping)
//      SCK     → GPIO 15   (strapping: phải ở mức HIGH lúc boot — nhưng trên mạch
//                           RC522 chân MISO đã có sẵn trở kéo 10kΩ; ngoài ra
//                           xung SCK luôn nghỉ ở mức LOW giữa các giao tiếp — RẤT AN TOÀN)
//      MOSI    → GPIO 13   (an toàn, không phải chân strapping)
//      MISO    → GPIO 13   XUNG ĐỘT — xem cách sửa bên dưới.
//
//    Sơ đồ HSPI Đã Sửa (tránh hoàn toàn mọi lỗi strapping/xung đột):
//      SDA/SS  → GPIO 14
//      SCK     → GPIO 15
//      MOSI    → GPIO 2    (strapping: bắt buộc HIGH lúc boot để nạp flash bình thường;
//                           Chân MOSI của RC522 ở trạng thái LOW khi nghỉ — mức LOW lúc 
//                           khởi động là AN TOÀN cho GPIO2 vì GPIO2 LOW = Boot bình thường)
//      MISO    → GPIO 13
//      RST     → GPIO 4  ← KHÔNG AN TOÀN: GPIO4 điều khiển đèn Flash LED qua transistor Q1.
//                           RST phải ở mức HIGH để RC522 hoạt động → làm LED sáng rực mãi mãi.
//
//    QUYẾT ĐỊNH CUỐI CÙNG CHO CHÂN RST (Dựa theo Datasheet MFRC522):
//      MFRC522 có sẵn mạch Reset khi bật nguồn (Power-On Reset - POR).
//      Việc nối thẳng chân RST vào 3.3V KHÔNG được nhà sản xuất khuyên dùng cho bản
//      thương mại (vì mất khả năng dùng code để reset mạch khi giao tiếp SPI bị treo).
//      TUY NHIÊN, đối với nguyên mẫu Luận Văn, việc mất giao tiếp SPI đã được 
//      xử lý bằng code khởi tạo lại MFRC522.PCD_Init(), nên việc nối thẳng RST vào 
//      nguồn 3.3V là một SỰ ĐÁNH ĐỔI CHẤP NHẬN ĐƯỢC để không bị chiếm mất chân GPIO4 (Đèn Flash).
//
//      Hành động: Nối thẳng chân RST của RC522 vào nguồn 3.3V trên mạch (không dùng GPIO).
//      Trong Code: RFID_RST_PIN = -1 (Thư viện MFRC522 hiểu -1 nghĩa là không dùng chân RST).
// ------------------------------------------------------------------------------
#define RFID_SS_PIN       14      // GPIO14  — SDA / Chip Select
#define RFID_SCK_PIN      15      // GPIO15  — SPI Clock
#define RFID_MOSI_PIN      2      // GPIO2   — MOSI (LOW khi boot = strapping an toàn)
#define RFID_MISO_PIN     13      // GPIO13  — MISO
#define RFID_RST_PIN      -1      // RST nối trực tiếp vào 3.3V trên PCB (không dùng GPIO)

// ------------------------------------------------------------------------------
// 3. CAMERA OV2640 — Các chân này đã bị hàn cứng trên mạch AI Thinker, KHÔNG ĐƯỢC SỬA
// ------------------------------------------------------------------------------
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#endif
