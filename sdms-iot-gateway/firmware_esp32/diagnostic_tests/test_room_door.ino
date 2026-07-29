#include <Keypad.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>

// ==== CONFIGURATION PINOUT ====
#define ROW_1_PIN 14
#define ROW_2_PIN 27
#define ROW_3_PIN 26
#define ROW_4_PIN 25
#define COL_1_PIN 33
#define COL_2_PIN 32
#define COL_3_PIN 4
#define COL_4_PIN 16

#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22
#define SERVO_PIN 13

// ==== INSTANCES ====
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {ROW_1_PIN, ROW_2_PIN, ROW_3_PIN, ROW_4_PIN};
byte colPins[COLS] = {COL_1_PIN, COL_2_PIN, COL_3_PIN, COL_4_PIN};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo myServo;

void setup() {
    Serial.begin(115200);
    Serial.println("\n--- BẮT ĐẦU TEST PHẦN CỨNG ROOM DOOR ---");

    // 1. Test LCD
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("HARDWARE TEST");
    lcd.setCursor(0, 1);
    lcd.print("Press any key...");
    Serial.println("[OK] LCD Initialized.");

    // 2. Test Servo
    myServo.attach(SERVO_PIN);
    myServo.write(0); // Đóng cửa
    Serial.println("[OK] Servo attached on PIN 13.");
}

void loop() {
    char key = keypad.getKey();
    if (key) {
        Serial.print("Phím được nhấn: ");
        Serial.println(key);
        
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Key Pressed:");
        lcd.setCursor(0, 1);
        lcd.print(key);

        // Test logic Servo: Nhấn phím '*' để quay Servo
        if (key == '*') {
            Serial.println("=> MỞ CỬA (Servo 90 độ) trong 2 giây...");
            lcd.clear();
            lcd.print("SERVO OPENING...");
            myServo.write(90);
            delay(2000);
            myServo.write(0);
            Serial.println("=> ĐÓNG CỬA (Servo 0 độ)");
            lcd.clear();
            lcd.print("Press any key...");
        }
    }
}
