#ifndef RELAY_CONTROLLER_H
#define RELAY_CONTROLLER_H

#include <Arduino.h>

class RelayController {
public:
    static void init();
    static void unlock();
    static void lock();
    static void maintain(); // Call this in loop() for non-blocking lock

    static void emergencyUnlock();
    static void emergencyLock();

private:
    static unsigned long unlockStartTime;
    static bool isUnlocked;
    static bool emergencyMode;
};

#endif // RELAY_CONTROLLER_H
