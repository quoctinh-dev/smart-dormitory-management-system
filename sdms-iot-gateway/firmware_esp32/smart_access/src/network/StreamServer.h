#ifndef STREAM_SERVER_H
#define STREAM_SERVER_H

#include <Arduino.h>
#include "esp_http_server.h"

class StreamServer {
public:
    static void init();

private:
    static httpd_handle_t stream_httpd;
    static httpd_handle_t ui_httpd;
    
    static esp_err_t index_handler(httpd_req_t *req);
    static esp_err_t stream_handler(httpd_req_t *req);
    static esp_err_t capture_handler(httpd_req_t *req);
};

#endif // STREAM_SERVER_H
