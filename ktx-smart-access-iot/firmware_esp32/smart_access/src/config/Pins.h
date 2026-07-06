#ifndef PINS_H
#define PINS_H

// ==============================================================================
// SƠ ĐỒ CHÂN (PIN MAPPING) CHO AI-THINKER ESP32-CAM
// Căn cứ theo tài liệu: 01_hardware_pinout_design.md (Backend SSOT)
// ==============================================================================

// 1. CHÂN CẢM BIẾN & THIẾT BỊ NGOẠI VI
#define RELAY_PIN 12      // Điều khiển khóa cửa (Tuyệt đối KHÔNG cắm vào IO4)
#define BUTTON_PIN 13     // Nút bấm mềm để kích hoạt chụp ảnh thủ công (INPUT_PULLUP)
#define FLASH_LED_PIN 4   // Đèn Flash LED trên mạch (Sử dụng để nháy báo trạng thái nếu cần)

// 2. CHÂN MODULE RFID MFRC522 (Tạm tắt ở config, nhưng cứ khai báo trước)
// Tránh dùng chân 12, 13 (vì đã dùng cho Relay và Button) và tránh chân SD Card.
// Thông thường sẽ gán vào các chân IO 2, 14, 15... (Sẽ điều chỉnh sau khi có mạch thật)
#define RFID_SS_PIN 2
#define RFID_RST_PIN 15

// 3. CHÂN CAMERA OV2640 (Mặc định cố định cho ESP32-CAM)
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

#endif // PINS_H
