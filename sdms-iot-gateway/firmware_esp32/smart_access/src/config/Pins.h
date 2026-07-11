#ifndef PINS_H
#define PINS_H

// ==============================================================================
// PIN MAPPING — AI-THINKER ESP32-CAM (4MB Flash + 4MB PSRAM)
// Hardware Validation: 2026-07-11
//
// PERMANENTLY RESERVED — NEVER CONFIGURE AS GPIO:
//
//   GPIO 16 — PSRAM CS (hard-wired to PSRAM chip select on PCB).
//              Reconfiguring this pin disables PSRAM and causes
//              assert failed: block_locate_free (TLSF heap crash).
//
//   GPIO  0 — Strapping / Boot mode.
//              Must be HIGH during normal boot. LOW = Flash mode.
//
//   GPIO  4 — Flash LED (shared with SD card DATA1 / HS2_DATA1).
//              This pin drives the onboard high-power white LED through
//              transistor Q1. When driven HIGH the LED turns on.
//              We keep this pin LOW in firmware. Do NOT connect RC522 RST
//              here — the LED will glow continuously at HIGH.
//              GPIO 4 is NOT used for any external peripheral.
//
//   GPIO 12 — Strapping pin (Flash voltage selector: 3.3V vs 1.8V).
//              Must be LOW at power-on/reset. If pulled HIGH at boot the
//              ESP32 selects 1.8V flash supply → "flash read err" boot fail.
//              Safe to use AFTER boot completes provided the connected
//              device does not pull it HIGH during power-on.
//              Servo PWM signal is 0V at idle (LOW) — safe.
//
// References:
//   - AI Thinker ESP32-CAM schematic v1.0
//   - Espressif ESP32 datasheet (Strapping Pins: GPIO0, GPIO2, GPIO5, GPIO12, GPIO15)
//   - MFRC522 datasheet rev 3.9
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. SERVO (360-degree door latch motor)
//    GPIO12 — strapping pin but SAFE for servo because:
//      • Servo signal wire is 0V (LOW) at power-on (servo is detached/idle).
//      • PWM only activates after setup() completes — after strapping is sampled.
//      • DO NOT connect any pull-up resistor to this wire.
// ------------------------------------------------------------------------------
#define SERVO_PIN         12

// ------------------------------------------------------------------------------
// 2. RFID RC522 (HSPI bus)
//    DO NOT insert MicroSD card — the SD slot shares GPIO12/13/14/15/2.
//
//    RST is connected to GPIO 2 (safe GPIO, no strapping conflict post-boot).
//    MOSI moved to GPIO 13 to avoid GPIO2 strapping concerns at boot.
//
//    Final validated mapping:
//      SDA/SS  → GPIO 14   (safe, no strapping role)
//      SCK     → GPIO 15   (strapping: must be HIGH at boot — 10kΩ pull-up
//                           is already on RC522 MISO line which is input here;
//                           SCK idles LOW between transactions — SAFE)
//      MOSI    → GPIO 13   (safe, no strapping role)
//      MISO    → GPIO 13   CONFLICT — see below.
//
//    Corrected HSPI mapping (avoids all strapping/conflict issues):
//      SDA/SS  → GPIO 14
//      SCK     → GPIO 15
//      MOSI    → GPIO 2    (strapping: must be HIGH at boot for normal flash;
//                           RC522 MOSI idles LOW — LOW at boot is SAFE for GPIO2
//                           because GPIO2's strapping role is: LOW = normal boot.
//                           SAFE.)
//      MISO    → GPIO 13
//      RST     → GPIO 4  ← NOT SAFE: GPIO4 drives Flash LED via Q1 transistor.
//                           RST must be HIGH for RC522 to operate → LED ON always.
//
//    RST FINAL DECISION (per MFRC522 datasheet):
//      The MFRC522 has an internal Power-On Reset (POR) circuit.
//      RST pin tied to 3.3V is NOT recommended by datasheet for production
//      (loses ability to do software-triggered hardware reset if SPI hangs).
//      HOWEVER for a thesis prototype where SPI hang recovery is handled
//      by MFRC522.PCD_Init() retries in software, tying RST to 3.3V is
//      an ACCEPTABLE trade-off that avoids consuming GPIO4 (Flash LED).
//
//      RST → 3.3V rail directly (no GPIO needed).
//      In firmware: RFID_RST_PIN = -1 (MFRC522 library accepts -1 = no RST pin).
// ------------------------------------------------------------------------------
#define RFID_SS_PIN       14      // GPIO14  — SDA / Chip Select
#define RFID_SCK_PIN      15      // GPIO15  — SPI Clock
#define RFID_MOSI_PIN      2      // GPIO2   — MOSI (LOW at boot = safe strapping)
#define RFID_MISO_PIN     13      // GPIO13  — MISO
#define RFID_RST_PIN      -1      // RST wired directly to 3.3V on PCB (no GPIO)

// ------------------------------------------------------------------------------
// 3. CAMERA OV2640 — fixed by AI Thinker hardware, do NOT touch
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

#endif // PINS_H
