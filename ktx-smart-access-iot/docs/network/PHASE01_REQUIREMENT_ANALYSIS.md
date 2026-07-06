# PHASE 01 - REQUIREMENT ANALYSIS

## Objective

Analyze the network requirements of the Smart Dormitory Access Control System before implementing VLAN segmentation.

## System Components

* Spring Boot Backend
* PostgreSQL Database
* MQTT Broker
* ESP32 Controllers
* RFID Authentication
* Face Recognition
* Fingerprint Authentication
* Relay Controller
* Electronic Lock
* Web Admin
* Student Mobile Application

## Network Requirements

The system requires logical separation between administrative devices, student devices and IoT devices. Each group has different security requirements and traffic characteristics.

Administrative devices require access to system management functions and databases.

Student devices require access to backend services but should not access IoT devices directly.

IoT devices require communication with backend services through MQTT while remaining isolated from student devices.

## Expected Result

A scalable and secure network architecture suitable for Smart Dormitory deployment.
