#ifndef RFID_DRIVER_H
#define RFID_DRIVER_H

#include <Arduino.h>

class RfidDriver {
public:
    static void init();
    static void maintain();
    static String getDiagnostic();
private:
    static String diagnosticMessage;
};

#endif // RFID_DRIVER_H
