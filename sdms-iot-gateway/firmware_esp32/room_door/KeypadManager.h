#ifndef KEYPAD_MANAGER_H
#define KEYPAD_MANAGER_H

#include <Keypad.h>
#include "Config.h"
#include "NetworkManager.h"
#include "LcdManager.h"

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

String currentPin = "";
const int MAX_PIN_LENGTH = 6;

void initKeypad() {
    Serial.println("[Keypad] Initialized.");
}

void processKeypadInput() {
    char key = keypad.getKey();

    if (key) {
        Serial.print("[Keypad] Key Pressed: ");
        Serial.println(key);

        if (key == '#') {
            // Submit PIN
            if (currentPin.length() > 0) {
                verifyPinWithBackend(currentPin);
                currentPin = ""; // Reset sau khi gửi
            }
        } 
        else if (key == '*') {
            // Xóa (Clear) mã PIN hiện tại
            currentPin = "";
            lcdPrintMessage("READY!", "Enter PIN...");
        } 
        else {
            // Thêm phím vào chuỗi (Tối đa 6 ký tự)
            if (currentPin.length() < MAX_PIN_LENGTH) {
                currentPin += key;
                
                // Hiển thị dạng dấu sao (*)
                String displayPin = "";
                for(int i = 0; i < currentPin.length(); i++) {
                    displayPin += "*";
                }
                lcdPrintMessage("PIN: ", displayPin);
            }
        }
    }
}

#endif // KEYPAD_MANAGER_H
