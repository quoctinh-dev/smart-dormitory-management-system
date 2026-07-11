#ifndef RELAY_CONTROLLER_H
#define RELAY_CONTROLLER_H

#include <Arduino.h>

class RelayController {
public:
    static void init();
    static void unlock();
    static void lock();
    static void maintain(); // Call this in loop() for non-blocking lock

private:
    static unsigned long unlockStartTime;
    static bool isUnlocked;
};

#endif // RELAY_CONTROLLER_H
