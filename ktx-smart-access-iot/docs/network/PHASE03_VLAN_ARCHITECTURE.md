PHASE 03 - VLAN ARCHITECTURE DESIGN
1. Mục tiêu

Thiết kế kiến trúc VLAN cho hệ thống Ký túc xá Thông minh nhằm:

Tách biệt các nhóm thiết bị theo chức năng.
Tăng cường bảo mật.
Giảm Broadcast Domain.
Tạo nền tảng cho Inter-VLAN Routing ở các giai đoạn tiếp theo.
Mô phỏng kiến trúc mạng thực tế của Smart Building.
2. VLAN Definition
VLAN ID	VLAN Name	Chức năng	Thiết bị
10	ADMIN	Quản trị hệ thống	ADMIN_PC, KTX_SERVER
20	STUDENT	Người dùng sinh viên	STUDENT_LAPTOP, Mobile App Users
30	IOT	Thiết bị IoT	RFID_NODE_01, ESP32_DOOR_01
3. IP Address Plan
VLAN 10 - ADMIN
Thiết bị	Địa chỉ IP
Gateway	192.168.10.1
ADMIN_PC	192.168.10.10
KTX_SERVER	192.168.10.20

Subnet Mask:

255.255.255.0
VLAN 20 - STUDENT
Thiết bị	Địa chỉ IP
Gateway	192.168.20.1
STUDENT_LAPTOP	DHCP

DHCP Pool dự kiến:

192.168.20.100 - 192.168.20.200

Subnet Mask:

255.255.255.0
VLAN 30 - IOT
Thiết bị	Địa chỉ IP
Gateway	192.168.30.1
RFID_NODE_01	192.168.30.10
ESP32_DOOR_01	192.168.30.20

Subnet Mask:

255.255.255.0
4. Port Mapping
Switch SW1_KTX
Interface	Device	VLAN
Fa0/1	R1_KTX	Trunk/Uplink
Fa0/2	KTX_SERVER	VLAN 10
Fa0/3	ADMIN_PC	VLAN 10
Fa0/4	KTX_WIFI	VLAN 20
Fa0/5	RFID_NODE_01	VLAN 30
Fa0/6	ESP32_DOOR_01	VLAN 30
5. VLAN Logical Diagram
                     R1_KTX
                        |
                     SW1_KTX
                        |
-------------------------------------------------
|                    |                          |
|                    |                          |
VLAN 10          VLAN 20                    VLAN 30
ADMIN            STUDENT                    IOT

ADMIN_PC       STUDENT_LAPTOP             RFID_NODE_01
KTX_SERVER                               ESP32_DOOR_01
6. Liên hệ với hệ thống Smart Dormitory
VLAN 10 - ADMIN

Chứa các thành phần quản trị hệ thống:

Web Admin
Spring Boot Backend
PostgreSQL Database

Nhóm này có quyền quản trị cao nhất.

VLAN 20 - STUDENT

Chứa các thiết bị truy cập của sinh viên:

Laptop
Mobile App
Web Client

Nhóm này chỉ được phép truy cập dịch vụ ứng dụng.

VLAN 30 - IOT

Chứa các thiết bị điều khiển và xác thực:

RFID Reader
ESP32 Controller
Fingerprint Device
Face Recognition Device

Các thiết bị này trao đổi dữ liệu thông qua MQTT Broker.

7. Lợi ích của kiến trúc VLAN
Giảm Broadcast Traffic.
Tăng khả năng mở rộng.
Tăng cường bảo mật.
Dễ triển khai Access Control.
Phù hợp với mô hình Smart Building và Smart Dormitory thực tế.
8. Kết luận

Sau PHASE 03, hệ thống đã hoàn thành thiết kế kiến trúc VLAN bao gồm:

VLAN 10 (ADMIN)
VLAN 20 (STUDENT)
VLAN 30 (IOT)

Kiến trúc này sẽ được triển khai trên Switch Cisco 2960 và Router 2911 trong PHASE 04 để thực hiện Inter-VLAN Routing và kiểm thử khả năng phân tách mạng.