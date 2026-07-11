# DAY 03 - NETWORK SECURITY & ACCESS CONTROL

# PHASE 3 - SECURITY POLICY DESIGN

---

# 1. Introduction

## 1.1 Purpose

This document defines the security policies for the Smart Dormitory Access Control System.

The objective is to transform the logical access relationships identified in the Access Matrix into enforceable security rules that will later be implemented using Access Control Lists (ACLs).

This document specifies:

* Authorized communications
* Unauthorized communications
* Allowed services
* Restricted services
* Security enforcement requirements

The resulting policies serve as the foundation for ACL architecture and implementation.

---

## 1.2 Scope

The policies defined in this document apply to:

### Network Infrastructure

* Router Cisco 2911
* Switch Cisco 2960
* Inter-VLAN Routing

### Server Infrastructure

* Spring Boot Backend
* PostgreSQL Database
* MQTT Broker

### Client Infrastructure

* Admin Devices
* Student Devices

### IoT Infrastructure

* ESP32 Controllers
* RFID Readers
* Electronic Locks

### Future Components

* Face Recognition Module
* Fingerprint Recognition Module

---

# 2. Security Architecture Overview

## 2.1 Current Network Architecture

```text id="vh5thc"
VLAN 10 - ADMIN
192.168.10.0/24

ADMIN_PC
KTX_SERVER
 ├── Spring Boot Backend
 ├── PostgreSQL Database
 └── MQTT Broker

--------------------------------

VLAN 20 - STUDENT
192.168.20.0/24

STUDENT_LAPTOP

--------------------------------

VLAN 30 - IOT
192.168.30.0/24

RFID_NODE_01
ESP32_DOOR_01
```

---

## 2.2 Security Zones

| Zone    | VLAN    | Trust Level |
| ------- | ------- | ----------- |
| ADMIN   | VLAN 10 | HIGH        |
| STUDENT | VLAN 20 | LOW         |
| IOT     | VLAN 30 | MEDIUM      |

---

# 3. Security Policy Objectives

The system security policies are designed to achieve the following objectives.

---

## SPO-01

Protect critical server infrastructure.

---

## SPO-02

Prevent unauthorized database access.

---

## SPO-03

Protect MQTT communication channels.

---

## SPO-04

Prevent unauthorized access to IoT devices.

---

## SPO-05

Limit malware propagation across VLANs.

---

## SPO-06

Implement the Principle of Least Privilege.

---

## SPO-07

Implement Zero Trust communication.

---

## SPO-08

Reduce attack surface exposure.

---

# 4. Service Inventory

The following services are deployed within the Smart Dormitory ecosystem.

---

## Backend Service

Host:

KTX_SERVER

Protocols:

* HTTP
* HTTPS

Ports:

| Service | Port |
| ------- | ---- |
| HTTP    | 8080 |
| HTTPS   | 443  |

Purpose:

* Authentication
* Authorization
* Business Logic
* User Management

---

## PostgreSQL Database

Host:

KTX_SERVER

Protocol:

* PostgreSQL TCP

Port:

5432

Purpose:

* Student Data Storage
* Access History
* Audit Logs

---

## MQTT Broker

Host:

KTX_SERVER

Protocols:

* MQTT
* MQTT TLS

Ports:

| Service  | Port |
| -------- | ---- |
| MQTT     | 1883 |
| MQTT TLS | 8883 |

Purpose:

* Device Communication
* Access Control Messaging

---

## SSH Management

Host:

KTX_SERVER

Protocol:

SSH

Port:

22

Purpose:

* Administrative Management
* System Maintenance

---

# 5. Student Security Policies

The Student Zone is considered the highest-risk network segment because devices are unmanaged and may be compromised.

---

## SP-STU-01

Policy Name:

Student Access Backend

Source:

VLAN 20

Destination:

Backend Service

Ports:

* 8080
* 443

Action:

ALLOW

Reason:

Required for application usage.

---

## SP-STU-02

Policy Name:

Student Access Database

Source:

VLAN 20

Destination:

PostgreSQL

Port:

5432

Action:

DENY

Reason:

Students must never access the database directly.

---

## SP-STU-03

Policy Name:

Student Access MQTT Broker

Source:

VLAN 20

Destination:

MQTT Broker

Ports:

* 1883
* 8883

Action:

DENY

Reason:

Prevent unauthorized publish and subscribe actions.

---

## SP-STU-04

Policy Name:

Student Access IoT Zone

Source:

VLAN 20

Destination:

VLAN 30

Action:

DENY

Reason:

No business requirement exists.

---

## SP-STU-05

Policy Name:

Student SSH Access

Source:

VLAN 20

Destination:

KTX_SERVER

Port:

22

Action:

DENY

Reason:

Students are not authorized administrators.

---

# 6. Administrator Security Policies

Administrators are responsible for system operation and maintenance.

---

## SP-ADM-01

Policy Name:

Admin Access Backend

Action:

ALLOW

Ports:

* 8080
* 443

Purpose:

System Management

---

## SP-ADM-02

Policy Name:

Admin Access Database

Action:

ADMINISTRATIVE ACCESS ONLY

Port:

5432

Purpose:

* Backup
* Recovery
* Troubleshooting
* Audit Investigation
* Database Maintenance

Recommended Access Path:

```text id="ndgr36"
Admin
 ↓
Backend
 ↓
Database
```

Direct database access should be minimized.

---

## SP-ADM-03

Policy Name:

Admin Access MQTT Broker

Action:

ALLOW

Ports:

* 1883
* 8883

Purpose:

MQTT Administration and Monitoring

---

## SP-ADM-04

Policy Name:

Admin SSH Access

Action:

ALLOW

Port:

22

Purpose:

Server Administration

---

## SP-ADM-05

Policy Name:

Admin Access IoT Devices

Action:

ALLOW

Purpose:

* Monitoring
* Diagnostics
* Maintenance

---

# 7. IoT Security Policies

The IoT Zone contains operational technology components responsible for physical access control.

---

## SP-IOT-01

Policy Name:

IoT Access MQTT Broker

Source:

VLAN 30

Destination:

MQTT Broker

Port:

1883

Action:

ALLOW

Reason:

Required for messaging operations.

---

## SP-IOT-02

Policy Name:

IoT Access Backend

Source:

VLAN 30

Destination:

Backend Service

Port:

8080

Action:

ALLOW

Reason:

Required for device integration workflows.

---

## SP-IOT-03

Policy Name:

IoT Access Database

Source:

VLAN 30

Destination:

PostgreSQL

Port:

5432

Action:

DENY

Reason:

IoT devices do not require direct database access.

---

## SP-IOT-04

Policy Name:

IoT Access Student VLAN

Source:

VLAN 30

Destination:

VLAN 20

Action:

DENY

Reason:

No operational requirement exists.

---

## SP-IOT-05

Policy Name:

IoT Access Admin Devices

Source:

VLAN 30

Destination:

ADMIN_PC

Action:

DENY

Reason:

Prevents lateral movement after device compromise.

---

# 8. Inter-VLAN Security Policies

---

## VLAN10 → VLAN20

Policy:

Administrative Access Only

Purpose:

* Troubleshooting
* Support
* Investigation

---

## VLAN10 → VLAN30

Policy:

ALLOW

Purpose:

System Administration

---

## VLAN20 → VLAN10

Policy:

Limited Allow

Allowed Services:

* Backend HTTP
* Backend HTTPS

All other communications denied.

---

## VLAN20 → VLAN30

Policy:

DENY

Reason:

No business requirement exists.

---

## VLAN30 → VLAN10

Policy:

Limited Allow

Allowed Services:

* MQTT
* Backend

All other communications denied.

---

## VLAN30 → VLAN20

Policy:

DENY

Reason:

Prevent attack propagation.

---

# 9. Data Flow Security Model

## Student Authentication

```text id="x62c93"
Student
 ↓ HTTPS
Backend
 ↓ SQL
Database
```

Status:

ALLOWED

---

## RFID Authentication

```text id="bgd8n5"
RFID
 ↓
ESP32
 ↓ MQTT
Broker
 ↓
Backend
 ↓ SQL
Database
```

Status:

ALLOWED

---

## Door Unlock Workflow

```text id="e0k9m8"
Backend
 ↓ MQTT
Broker
 ↓
ESP32
 ↓
Relay
 ↓
Electronic Lock
```

Status:

ALLOWED

---

## Student Malware Scenario

```text id="rrgr1t"
Malware
 ↓
Database
```

Status:

DENIED

---

```text id="rqphji"
Malware
 ↓
MQTT Broker
```

Status:

DENIED

---

```text id="9qf8kv"
Malware
 ↓
IoT Devices
```

Status:

DENIED

---

# 10. Default Security Policy

## SP-DEF-01

Policy Name:

Default Deny

Description:

All communications not explicitly authorized shall be denied.

Rule:

```text id="b7ydf2"
ANY SOURCE
      ↓
ANY DESTINATION
      ↓
NOT EXPLICITLY ALLOWED
```

Action:

DENY

---

## Security Principles Applied

### Principle 1

Least Privilege

---

### Principle 2

Network Segmentation

---

### Principle 3

Defense in Depth

---

### Principle 4

Zero Trust Network

---

### Principle 5

Default Deny

---

# 11. Future Security Considerations

Future project phases will integrate:

* Face Recognition Module
* Fingerprint Recognition Module

Deployment Plan:

VLAN 30 - IoT Zone

Security Requirements:

* No direct Student access
* Backend-mediated communication
* ACL protection
* VLAN isolation

This ensures consistency with existing security policies.

---

# 12. Policy Matrix Summary

| Source  | Destination | Port | Action                     |
| ------- | ----------- | ---- | -------------------------- |
| Student | Backend     | 8080 | Allow                      |
| Student | Backend     | 443  | Allow                      |
| Student | Database    | 5432 | Deny                       |
| Student | MQTT        | 1883 | Deny                       |
| Student | MQTT TLS    | 8883 | Deny                       |
| Student | SSH         | 22   | Deny                       |
| Student | VLAN30      | Any  | Deny                       |
| Admin   | Backend     | 8080 | Allow                      |
| Admin   | Backend     | 443  | Allow                      |
| Admin   | Database    | 5432 | Administrative Access Only |
| Admin   | MQTT        | 1883 | Allow                      |
| Admin   | MQTT TLS    | 8883 | Allow                      |
| Admin   | SSH         | 22   | Allow                      |
| Admin   | IoT VLAN    | Any  | Allow                      |
| IoT     | Backend     | 8080 | Allow                      |
| IoT     | MQTT        | 1883 | Allow                      |
| IoT     | Database    | 5432 | Deny                       |
| IoT     | VLAN20      | Any  | Deny                       |

---

# 13. Conclusion

The Security Policy Design establishes formal communication rules between all major components of the Smart Dormitory Access Control System.

The policies enforce:

* Least Privilege Access
* VLAN Isolation
* Service-Level Protection
* Zero Trust Principles
* Controlled Inter-VLAN Communication

These policies serve as the authoritative source for:

* PHASE 4 – ACL Architecture Design
* PHASE 5 – Packet Tracer ACL Implementation

All ACL rules must be derived directly from the policies defined in this document.
