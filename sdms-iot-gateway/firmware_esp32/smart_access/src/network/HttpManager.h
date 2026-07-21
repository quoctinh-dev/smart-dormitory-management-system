#ifndef HTTP_MANAGER_H
#define HTTP_MANAGER_H

#include <Arduino.h>
#include "esp_camera.h"

class HttpManager {
public:
    static String uploadFace(camera_fb_t *fb);
    static bool verifyCard(String rfidCode, camera_fb_t *fb);

    /**
     * Kéo RFID Whitelist từ Backend về và lưu vào NVS.
     * Gọi API: GET /api/v1/smartaccess/rfid-whitelist?buildingId=<BUILDING_ID>
     * @return Số UID đã lưu, -1 nếu thất bại
     */
    static int fetchAndSaveWhitelist();
    
    /**
     * Đồng bộ log quét thẻ lúc offline lên Backend.
     * Gọi API: POST /api/v1/smartaccess/offline-log-batch
     */
    static void syncOfflineLogs();
};

#endif // HTTP_MANAGER_H
