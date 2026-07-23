# AUDIT THỰC TẾ KỸ THUẬT: Mục 2.2 CÔNG NGHỆ SỬ DỤNG
Dựa trên mã nguồn thực tế (File cấu hình Docker, pom.xml, package.json, requirements.txt, .ino), đây là danh sách chính xác 100% các công nghệ được sử dụng trong dự án:

## 2.2.1 Công nghệ Phần mềm
- **Backend (Máy chủ xử lý lõi):** Java 17, Framework Spring Boot 3.5, Hibernate/JPA, Spring Security (xác thực JWT), tích hợp Webhook của SePay để thanh toán tự động.
  - *Code Evidence:* Nằm trong file `sdms-backend/pom.xml` (Khai báo dependency spring-boot-starter-web, jjwt-api, postgresql).
- **Cơ sở dữ liệu (Database):** PostgreSQL 16 (triển khai qua Docker).
  - *Code Evidence:* Nằm trong file `docker-compose.yml` (Image `postgres:16-alpine`).
- **Frontend (Web Admin & Web Student):** React 18, Build tool Vite, UI Library Material-UI (MUI), gọi API qua Axios.
  - *Code Evidence:* Nằm trong file `sdms-frontend/package.json` (Khai báo `"react": "^18.2.0"`, `"@mui/material"`, `"vite"`).
- **Mobile App (Ứng dụng Android):** Native Android, Kotlin, Jetpack Compose, ML Kit Face Detection, Room Database + SQLCipher, RootBeer, Biometric.
  - *Code Evidence:* Nằm trong file `smart-dormitory-app/app/build.gradle.kts` (Khai báo `libs.plugins.kotlin.compose`, `com.google.mlkit:face-detection`, `androidx.biometric:biometric`, `libs.rootbeer`).
- **Dịch vụ Trí tuệ nhân tạo (AI Service):** Python, Framework FastAPI, thư viện `facenet-pytorch` (Dùng MTCNN để detect mặt và InceptionResnetV1 để trích xuất vector 512 chiều).
  - *Code Evidence:* Nằm trong file `sdms-ai-service/requirements.txt` (Khai báo `fastapi`, `facenet-pytorch`) và logic code tại `main.py`.
- **Dịch vụ bên thứ ba (Third-party):** Cloudinary (lưu trữ hình ảnh CCCD, chân dung sinh viên), Brevo API (gửi email thông báo).
  - *Code Evidence:* Khai báo `CLOUDINARY_URL` và `BREVO_API_KEY` trong `docker-compose.yml` và `.env`.

## 2.2.2 Nền tảng Phần cứng (IoT)
- **Cụm Cổng chính (Smart Access):** ESP32-CAM, Camera OV2640, RFID RC522.
  - *Code Evidence:* Nằm trong file `sdms-iot-gateway/firmware_esp32/smart_access/smart_access.ino` (Code `#include <MFRC522.h>`, `#include "esp_camera.h"`).
- **Cụm Cửa phòng (Room Door):** ESP32, Bàn phím ma trận (Keypad), Màn hình LCD I2C.
  - *Code Evidence:* Nằm trong file `sdms-iot-gateway/firmware_esp32/room_door/room_door.ino` (Code `#include "KeypadManager.h"`, `#include "LcdManager.h"`).
- **Giao thức truyền thông:** MQTT và HTTP REST.
  - *Code Evidence:* Sử dụng `#include <PubSubClient.h>` để truyền nhận tín hiệu MQTT đóng mở Relay/Servo ở cả 2 cụm.

## 2.2.3 Công nghệ Triển khai (Deployment)
- **Containerization:** Docker và Docker Compose (Quản lý đồng thời 5 container: Postgres, Backend Spring Boot, Frontend React, AI Service FastAPI, và Mosquitto MQTT Broker).
- **MQTT Broker:** Eclipse Mosquitto (phiên bản 2.0.15).
  - *Code Evidence:* Toàn bộ được định nghĩa kiến trúc tại file `docker-compose.yml` nằm ở thư mục gốc của dự án.
