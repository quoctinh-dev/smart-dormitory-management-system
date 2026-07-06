# ESP32-CAM HARDWARE PINOUT MAPPING

Dưới đây là sơ đồ chân (Pinout) thực tế của mạch ESP32-CAM đang được sử dụng trong dự án Smart Dormitory Management System (SDMS). Sơ đồ này phục vụ cho việc đấu nối mạch nạp FTDI và các linh kiện ngoại vi (Relay, Nút bấm).

## HÀNG CHÂN BÊN TRÁI (Từ trên xuống)
| Tên Chân | Chức năng vật lý / Ghi chú |
| :--- | :--- |
| **5V** | Nguồn dương 5V (Nên dùng nguồn này nếu dùng thêm Relay để đảm bảo dòng). |
| **GND** | Chân nối đất (Ground). |
| **IO12** | Chân GPIO 12 - Điều khiển khóa cửa (Relay). |
| **IO13** | Chân GPIO 13 - Nút bấm (Button) để kích hoạt chụp ảnh Face ID. |
| **IO15** | Chân GPIO 15 (Dự phòng cho SPI / RFID). |
| **IO14** | Chân GPIO 14 (Dự phòng cho SPI / RFID). |
| **IO2** | Chân GPIO 2 (Dự phòng cho SPI / RFID). |
| **IO4** | Chân GPIO 4 - Đèn Flash siêu sáng trên board (Tránh cắm nhầm, dễ cháy mắt). |

## HÀNG CHÂN BÊN PHẢI (Từ trên xuống)
| Tên Chân | Chức năng vật lý / Ghi chú |
| :--- | :--- |
| **3V3** | Nguồn dương 3.3V (Dùng cấp nguồn nếu không có 5V, dòng yếu hơn). |
| **IO16** | Chân GPIO 16 (UART2 RX, dự phòng). |
| **IO0** | Chân GPIO 0 - Chân cấu hình Boot. **Nối với GND để nạp code**. Rút ra khi chạy. |
| **GND** | Chân nối đất (Ground). |
| **VCC** | Nguồn cấp tùy chọn. |
| **U0R** | UART0 RX - Nối với chân **TX** của mạch nạp FTDI (USB-to-TTL). |
| **U0T** | UART0 TX - Nối với chân **RX** của mạch nạp FTDI (USB-to-TTL). |
| **GND** | Chân nối đất (Ground) chung. |

---
*Ghi chú: Việc kích hoạt GPIO 13 để chụp ảnh chỉ cần dùng một đầu dây quẹt nhẹ xuống GND (không cần nút nhấn vật lý trong quá trình test).*
