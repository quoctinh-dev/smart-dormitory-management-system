#ifndef OFFLINE_ACCESS_LOG_H
#define OFFLINE_ACCESS_LOG_H

#include <Arduino.h>

class OfflineAccessLog {
public:
    static void begin();
    
    // Lưu lịch sử quẹt thẻ. timestamp = millis()
    static void push(const String& uid, unsigned long timestamp, const String& action);
    
    // Kiểm tra có log chưa đồng bộ không
    static bool hasPending();
    
    // Số lượng log đang chờ
    static int getPendingCount();
    
    // Tạo JSON payload chứa mảng các log
    static String getBatchJson();
    
    // Xóa log sau khi đã đồng bộ thành công
    static void clear();

private:
    static const char* NVS_NAMESPACE;
    static const char* KEY_HEAD;
    static const char* KEY_COUNT;
    
    static const int MAX_LOGS = 50; // Tối đa 50 logs (chiếm khoảng 2KB - 3KB trong NVS)
    
    static int _head;
    static int _count;
};

#endif
