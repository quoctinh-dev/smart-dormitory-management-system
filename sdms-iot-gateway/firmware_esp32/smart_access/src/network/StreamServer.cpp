#include "StreamServer.h"
#include "../drivers/CameraDriver.h"
#include "HttpManager.h"
#include "esp_camera.h"
#include "../config/Pins.h"

httpd_handle_t StreamServer::stream_httpd = NULL;
httpd_handle_t StreamServer::ui_httpd = NULL;

#define PART_BOUNDARY "123456789000000000000987654321"
static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

static const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SDMS Smart Access</title>
    <style>
        :root { --primary: #10b981; --primary-hover: #059669; --bg: #0f172a; --card: #1e293b; --text: #f8fafc; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background-color: var(--bg); color: var(--text); margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; font-size: 28px; background: linear-gradient(135deg, #34d399 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header p { color: #94a3b8; font-size: 16px; margin-top: 5px; }
        .camera-box { position: relative; width: 640px; height: 480px; max-width: 95vw; max-height: calc(95vw * 0.75); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.1); background: #000; }
        .camera-box img { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        .mask { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 280px; height: 380px; border: 3px dashed var(--primary); border-radius: 50%; box-shadow: 0 0 0 4000px rgba(15, 23, 42, 0.75); }
        .btn-capture { margin-top: 30px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%); color: white; border: none; padding: 16px 40px; font-size: 18px; font-weight: 600; border-radius: 50px; cursor: pointer; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); transition: all 0.2s ease; display: flex; align-items: center; gap: 10px; }
        .btn-capture:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(16, 185, 129, 0.4); }
        .btn-capture:active { transform: translateY(1px); }
        .btn-capture:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s ease-in-out infinite; display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        #toast { position: fixed; top: 20px; right: -100%; background: #1e293b; padding: 15px 25px; border-radius: 12px; border-left: 5px solid var(--primary); box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-weight: 600; transition: 0.3s ease-in-out; z-index: 1000; }
        #toast.show { right: 20px; }
        #toast.success { border-color: #10b981; }
        #toast.error { border-color: #ef4444; }
    </style>
</head>
<body>
    <div id="toast">Message here</div>

    <div class="header">
        <h2>Smart Access AI</h2>
        <p>Vui lòng đưa khuôn mặt vào giữa vòng Oval</p>
    </div>

    <div class="camera-box">
        <img src="" id="streamImg" onerror="console.log('Stream error'); this.onerror=null;">
        <div class="overlay">
            <div class="mask"></div>
        </div>
    </div>

    <button class="btn-capture" id="captureBtn" onclick="capture()">
        <span class="spinner" id="spinner"></span>
        <span id="btnText">📸 QUÉT MỞ CỬA</span>
    </button>

    <script>
        window.onload = function() {
            document.getElementById('streamImg').src = 'http://' + window.location.hostname + ':81/stream';
        };

        function showToast(msg, isSuccess) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.className = isSuccess ? 'show success' : 'show error';
            setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 4000);
        }

        function capture() {
            const btn = document.getElementById('captureBtn');
            const spinner = document.getElementById('spinner');
            const btnText = document.getElementById('btnText');
            
            btn.disabled = true;
            spinner.style.display = 'block';
            btnText.innerText = 'Đang phân tích...';

            fetch('/capture', { method: 'POST' })
            .then(res => res.text())
            .then(text => {
                btn.disabled = false;
                spinner.style.display = 'none';
                btnText.innerText = '📸 QUÉT MỞ CỬA';
                
                if (text === 'GRANTED') {
                    showToast('✅ Xác thực thành công! Cửa đang mở...', true);
                } else if (text.startsWith('DENIED')) {
                    showToast('❌ ' + text.split(':')[1], false);
                } else if (text.startsWith('API_ERROR')) {
                    let errorMsg = text.split(':')[1];
                    // Dịch các lỗi phổ biến sang tiếng Việt cho thân thiện UX
                    if (errorMsg.includes("No face detected")) {
                        errorMsg = "Không tìm thấy khuôn mặt, hãy thử Bật Đèn Flash!";
                    } else if (errorMsg.includes("Vui lòng đợi 2 giây")) {
                        // Lỗi rate limit đã là tiếng việt
                    }
                    showToast('⚠️ ' + errorMsg, false);
                } else {
                    showToast('⚠️ Lỗi hệ thống: ' + text, false);
                }
            })
            .catch(err => {
                btn.disabled = false;
                spinner.style.display = 'none';
                btnText.innerText = '📸 QUÉT MỞ CỬA';
                showToast('❌ Lỗi kết nối đến thiết bị!', false);
            });
        }
    </script>
</body>
</html>
)rawliteral";

esp_err_t StreamServer::index_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "text/html; charset=utf-8");
    return httpd_resp_send(req, index_html, strlen(index_html));
}

esp_err_t StreamServer::stream_handler(httpd_req_t *req) {
    camera_fb_t * fb = NULL;
    esp_err_t res = ESP_OK;
    size_t _jpg_buf_len = 0;
    uint8_t * _jpg_buf = NULL;
    char * part_buf[64];

    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
    if(res != ESP_OK) return res;

    while(true) {
        fb = CameraDriver::capture();
        if (!fb) {
            Serial.println("[StreamServer] Camera capture failed, retrying...");
            vTaskDelay(100 / portTICK_PERIOD_MS);
            continue; // Không break luồng, chỉ thử lại vào chu kỳ tới
        } else {
            _jpg_buf_len = fb->len;
            _jpg_buf = fb->buf;
        }
        
        if(res == ESP_OK) {
            size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);
            res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
        }
        if(res == ESP_OK) {
            res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
        }
        if(res == ESP_OK) {
            res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
        }
        
        if(fb) {
            CameraDriver::release(fb);
            fb = NULL;
        } else {
            _jpg_buf = NULL;
        }
        
        if(res != ESP_OK) {
            break;
        }
        
        // Small delay to prevent watchdog panic and allow other tasks to run
        vTaskDelay(100 / portTICK_PERIOD_MS); 
    }
    return res;
}

static unsigned long lastCaptureTime = 0;

esp_err_t StreamServer::capture_handler(httpd_req_t *req) {
    // Chống Spam API / Rate Limit (DDoS Protection)
    if (millis() - lastCaptureTime < 2000) {
        Serial.println("[StreamServer] WARN: Rate limit triggered on /capture");
        httpd_resp_send(req, "API_ERROR:Vui lòng đợi 2 giây giữa các lần quét", HTTPD_RESP_USE_STRLEN);
        return ESP_OK;
    }
    lastCaptureTime = millis();

    Serial.println("\n[StreamServer] Web capture button pressed! Capturing face...");
    camera_fb_t* fb = CameraDriver::capture();
    String res = "CAMERA_ERROR";
    
    if (fb != nullptr) {
        // Gọi thẳng HttpManager, task này sẽ block 1-2s (không sao đối với web worker)
        res = HttpManager::uploadFace(fb);
        CameraDriver::release(fb);
    } else {
        Serial.println("[StreamServer] Failed to capture frame for upload!");
    }
    
    // Trả kết quả chữ (GRANTED/DENIED...) về cho Web JS xử lý
    httpd_resp_send(req, res.c_str(), res.length());
    return ESP_OK;
}

void StreamServer::init() {
    static httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.server_port = 80;

    static httpd_uri_t index_uri = {}; 
    index_uri.uri       = "/";
    index_uri.method    = HTTP_GET;
    index_uri.handler   = index_handler;
    index_uri.user_ctx  = NULL;
    
    static httpd_uri_t capture_uri = {};
    capture_uri.uri       = "/capture";
    capture_uri.method    = HTTP_POST;
    capture_uri.handler   = capture_handler;
    capture_uri.user_ctx  = NULL;

    Serial.println("[StreamServer] Starting UI web server on port 80...");
    if (httpd_start(&ui_httpd, &config) == ESP_OK) {
        Serial.println("[StreamServer] DEBUG: httpd_start OK, registering index_uri...");
        httpd_register_uri_handler(ui_httpd, &index_uri);
        Serial.println("[StreamServer] DEBUG: index_uri registered, registering capture_uri...");
        httpd_register_uri_handler(ui_httpd, &capture_uri);
        Serial.println("[StreamServer] UI web server started successfully!");
    } else {
        Serial.println("[StreamServer] Failed to start UI web server!");
    }

    config.server_port = 81;
    config.ctrl_port = 32769; // Bắt buộc phải đổi ctrl_port sang số khác (Mặc định của HTTPD_DEFAULT_CONFIG là 32768)
    
    static httpd_uri_t stream_uri = {};
    stream_uri.uri       = "/stream";
    stream_uri.method    = HTTP_GET;
    stream_uri.handler   = stream_handler;
    stream_uri.user_ctx  = NULL;

    Serial.println("[StreamServer] Starting Stream web server on port 81...");
    if (httpd_start(&stream_httpd, &config) == ESP_OK) {
        httpd_register_uri_handler(stream_httpd, &stream_uri);
        Serial.println("[StreamServer] Stream web server started successfully!");
    } else {
        Serial.println("[StreamServer] Failed to start Stream web server!");
    }
}
