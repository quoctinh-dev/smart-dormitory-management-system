#ifndef CAMERA_DRIVER_H
#define CAMERA_DRIVER_H

#include <Arduino.h>
#include "esp_camera.h"

class CameraDriver {
public:
    static bool init();
    static camera_fb_t* capture();
    static void release(camera_fb_t* fb);
};

#endif // CAMERA_DRIVER_H
