#include "CameraDriver.h"
#include "../config/Pins.h"
#include "../config/Config.h"

bool CameraDriver::init() {
    if (!ENABLE_CAMERA) return false;

    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sccb_sda = SIOD_GPIO_NUM;
    config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;
    
    // Tối ưu cấu hình từ Diagnostics Report
    if(psramFound()){
        Serial.println("[Camera] PSRAM found. Initializing with optimal settings...");
        config.frame_size = CAMERA_FRAME_SIZE; 
        config.jpeg_quality = CAMERA_JPEG_QUALITY; 
        config.fb_count = CAMERA_FB_COUNT;      
    } else {
        Serial.println("[Camera] WARNING: PSRAM not found. Using fallback settings.");
        config.frame_size = FRAMESIZE_QVGA; 
        config.jpeg_quality = 12;
        config.fb_count = 1;
    }

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("[Camera] Init Failed with error 0x%x\n", err);
        return false;
    }
    
    Serial.println("[Camera] Initialized Successfully!");
    return true;
}

camera_fb_t* CameraDriver::capture() {
    if (!ENABLE_CAMERA) return nullptr;

    // Kỹ thuật Xả Rác (Clear Buffer):
    // Do hệ thống chỉ dùng 1 Frame Buffer (để tiết kiệm RAM), frame đầu tiên 
    // trong bộ nhớ có thể là ảnh cũ từ vài phút trước. 
    // Ta lấy nó ra và hủy ngay để kích hoạt cảm biến chụp ảnh mới (real-time).
    camera_fb_t * dummy_fb = esp_camera_fb_get();
    if(dummy_fb) {
        esp_camera_fb_return(dummy_fb);
    }

    // Chụp ảnh thực tế
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("[Camera] Error: Camera capture failed!");
        return nullptr;
    }
    
    Serial.printf("[Camera] Captured image. File size: %u bytes\n", fb->len);
    return fb;
}

void CameraDriver::release(camera_fb_t* fb) {
    if (fb) {
        esp_camera_fb_return(fb);
        Serial.println("[Camera] Frame buffer released.");
    }
}
