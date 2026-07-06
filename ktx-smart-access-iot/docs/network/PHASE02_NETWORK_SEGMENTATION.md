# PHASE 02 - NETWORK SEGMENTATION

## Objective

Design network segmentation to improve security, management and scalability.

## Segment Definition

### VLAN 10 - ADMIN

Devices:

* ADMIN_PC
* KTX_SERVER

Purpose:

* System administration
* Database management
* Monitoring

### VLAN 20 - STUDENT

Devices:

* STUDENT_LAPTOP
* Student Mobile App Users

Purpose:

* Student access portal
* Attendance and access requests

### VLAN 30 - IOT

Devices:

* RFID_NODE_01
* ESP32_DOOR_01

Purpose:

* Authentication
* Sensor communication
* Door control

## Benefits

* Reduced broadcast traffic
* Improved security
* Easier management
* Better scalability
