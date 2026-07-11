# 📅 DAY 01 – Xây Dựng Hạ Tầng Mạng Cơ Bản Cho Hệ Thống Smart Dormitory

## 🎯 Mục tiêu

Trong ngày đầu tiên, tôi thực hiện xây dựng và cấu hình mô hình mạng cơ bản trên Cisco Packet Tracer nhằm tạo nền tảng cho hệ thống Kiểm soát ra vào Ký túc xá thông minh.

Hạ tầng mạng này sẽ là cơ sở để triển khai các thành phần:

* ESP32 IoT Devices
* MQTT Broker
* Spring Boot Backend
* PostgreSQL Database
* Web Admin
* Mobile App
* Face Recognition
* RFID Authentication
* Fingerprint Authentication

trong các giai đoạn tiếp theo của đồ án.

---

## 🏗️ Thiết Kế Topology

Mô hình mạng được xây dựng gồm:

* Router 2911 (R1_KTX)
* Switch 2960 (SW1_KTX)
* Server (KTX_SERVER)
* Admin PC (ADMIN_PC)
* Home Gateway (KTX_WIFI)
* Student Laptop (STUDENT_LAPTOP)

### Topology

![DAY01 Topology](../images/day01-topology.png)

---

## 🔌 Kết Nối Mạng

Các thiết bị được kết nối theo mô hình:

```text
R1_KTX
   |
SW1_KTX
   |
--------------------------------
|              |              |
KTX_SERVER  ADMIN_PC      KTX_WIFI
                                |
                        STUDENT_LAPTOP
```

---

## 🌐 Cấu Hình Địa Chỉ IP

### Mạng chính

```text
192.168.1.0/24
```

| Thiết bị           | Địa chỉ IP   |
| ------------------ | ------------ |
| Router             | 192.168.1.1  |
| Server             | 192.168.1.10 |
| Admin PC           | 192.168.1.20 |
| Home Gateway (WAN) | 192.168.1.30 |

### Mạng WiFi

```text
192.168.25.0/24
```

| Thiết bị           | Địa chỉ IP   |
| ------------------ | ------------ |
| Home Gateway (LAN) | 192.168.25.1 |
| Student Laptop     | DHCP         |

---

## 📶 Cấu Hình WiFi

Thông số cấu hình:

* SSID: KTX_WIFI
* Bảo mật: WPA2-PSK
* DHCP Server: Enable

Laptop sinh viên kết nối thành công và nhận IP tự động.

---

## 🔄 NAT Và Kết Nối Liên Mạng

Home Gateway hoạt động như một Wireless Router.

Thiết bị sử dụng:

* WAN: 192.168.1.30
* LAN: 192.168.25.1

Home Gateway thực hiện NAT cho phép các thiết bị thuộc mạng WiFi giao tiếp với hệ thống mạng chính.

Nhờ cơ chế này, Laptop vẫn có thể truy cập Router, Server và các dịch vụ khác trong hệ thống.

---

## 🧪 Kiểm Tra Kết Nối

Kết quả:

* Laptop ping thành công Router.
* Laptop ping thành công Server.
* Admin PC ping thành công Server.
* Toàn bộ hệ thống hoạt động ổn định.

---

## 📚 Kiến Thức Thu Được

Thông qua DAY 01, các kiến thức nền tảng đã được thực hành:

* LAN Networking
* Router
* Switch
* DHCP
* NAT
* Wireless Network
* Ping Testing

---

## ✅ Kết Quả Đạt Được

Hoàn thành xây dựng hạ tầng mạng cơ bản phục vụ hệ thống Smart Dormitory.

Topology đã sẵn sàng cho các bước tiếp theo:

* VLAN Design
* MQTT Communication
* ESP32 Integration
* IoT Network Segmentation

---

## 🚀 Kế Hoạch DAY 02

* Thiết kế VLAN
* VLAN Admin
* VLAN Student
* VLAN IoT
* Chuẩn bị hạ tầng cho MQTT Broker và các thiết bị ESP32
