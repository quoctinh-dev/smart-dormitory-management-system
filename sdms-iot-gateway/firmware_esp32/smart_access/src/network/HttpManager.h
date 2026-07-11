#ifndef HTTP_MANAGER_H
#define HTTP_MANAGER_H

#include <Arduino.h>
#include "esp_camera.h"

class HttpManager {
public:
    static String uploadFace(camera_fb_t *fb);
    static void verifyCard(String rfidCode);
};

#endif // HTTP_MANAGER_H
