# DAY 03 - NETWORK SECURITY & ACCESS CONTROL

# PHASE 4 - ACL ARCHITECTURE DESIGN

---

# 1. Introduction

## 1.1 Purpose

This document defines the Access Control List (ACL) architecture for the Smart Dormitory Access Control System.

The objective is to transform the Security Policies established in previous phases into a structured ACL deployment architecture.

This document specifies:

* ACL design strategy
* ACL placement strategy
* ACL inventory
* Traffic control architecture
* Security enforcement model

The resulting design will serve as the blueprint for ACL implementation in Cisco Packet Tracer.

---

## 1.2 Scope

This document applies to:

### Network Infrastructure

* Cisco Router 2911
* Cisco Switch 2960
* Router-on-a-Stick Architecture

### Security Zones

* VLAN 10 - ADMIN
* VLAN 20 - STUDENT
* VLAN 30 - IOT

### Services

* Spring Boot Backend
* PostgreSQL Database
* MQTT Broker
* SSH Management

---

# 2. Existing Network Architecture

## 2.1 Current Topology

```text id="f6l64w"
                    INTERNET
                        |
                        |
                   R1_KTX
                        |
                  802.1Q Trunk
                        |
                    SW1_KTX
     ------------------------------------------------
     |                     |                       |
 VLAN10                VLAN20                  VLAN30
 ADMIN                 STUDENT                  IOT
     |                     |                      |
ADMIN_PC           STUDENT_LAPTOP         RFID_NODE_01
KTX_SERVER                             ESP32_DOOR_01
```

---

## 2.2 Router Sub-Interfaces

| Interface | VLAN   | Gateway      |
| --------- | ------ | ------------ |
| Gi0/0.10  | VLAN10 | 192.168.10.1 |
| Gi0/0.20  | VLAN20 | 192.168.20.1 |
| Gi0/0.30  | VLAN30 | 192.168.30.1 |

---

# 3. ACL Design Objectives

The ACL architecture is designed to achieve the following objectives.

---

## AO-01

Prevent Student devices from accessing sensitive services.

---

## AO-02

Protect PostgreSQL Database.

---

## AO-03

Protect MQTT Broker.

---

## AO-04

Protect IoT Devices from unauthorized access.

---

## AO-05

Reduce malware propagation between VLANs.

---

## AO-06

Implement Least Privilege communication.

---

## AO-07

Implement Zero Trust Network principles.

---

## AO-08

Support future IoT expansion.

---

# 4. ACL Design Principles

## Principle 1 - Least Privilege

Only explicitly authorized communications are permitted.

---

## Principle 2 - Default Deny

Any traffic not explicitly allowed shall be denied.

---

## Principle 3 - Zero Trust

No VLAN is trusted by default.

All communications require explicit authorization.

---

## Principle 4 - Block Close to Source

Traffic should be filtered as close as possible to its origin.

Benefits:

* Reduced router processing
* Reduced attack surface
* Early threat containment

---

## Principle 5 - Simplicity

ACL architecture should remain manageable and maintainable.

The current project size does not justify excessive ACL complexity.

---

# 5. ACL Technology Selection

## Candidate 1 - Standard ACL

Capabilities:

* Source IP filtering only

Limitations:

* Cannot inspect destination addresses
* Cannot inspect TCP/UDP ports

Result:

NOT SUITABLE

---

## Candidate 2 - Extended ACL

Capabilities:

* Source IP
* Destination IP
* Protocol
* Port Number

Examples:

```text id="r2r8kn"
Student VLAN
 ↓
Backend TCP/8080

ALLOW
```

```text id="q4ndsg"
Student VLAN
 ↓
Database TCP/5432

DENY
```

Result:

SELECTED

---

# 6. ACL Placement Analysis

## 6.1 VLAN 20 - STUDENT

### Security Assessment

Trust Level:

LOW

Threats:

* Malware
* Network Scanning
* Unauthorized Access Attempts
* Credential Theft

---

### Placement Decision

ACL Location:

```text id="s3yyqa"
Gi0/0.20
Inbound
```

---

### Justification

Traffic is filtered immediately after entering the router.

```text id="7x7m1m"
Student
   ↓
ACL
   ↓
Router
```

This prevents unwanted traffic from reaching other VLANs.

---

## 6.2 VLAN 30 - IOT

### Security Assessment

Trust Level:

MEDIUM

Threats:

* Compromised ESP32
* Rogue Devices
* Unauthorized Firmware

---

### Placement Decision

ACL Location:

```text id="e2vclx"
Gi0/0.30
Inbound
```

---

### Justification

Compromised IoT devices are isolated before communicating with other network zones.

---

## 6.3 VLAN 10 - ADMIN

### Security Assessment

Trust Level:

HIGH

Components:

* ADMIN_PC
* Backend
* PostgreSQL
* MQTT Broker

---

### Placement Decision

No dedicated ACL in Phase 4.

---

### Justification

Administrative traffic requires flexibility.

Access restrictions will be enforced primarily through Student and IoT ACLs.

---

# 7. ACL Inventory

The system will deploy two primary ACLs.

---

## ACL-01

ACL Name:

ACL-STUDENT-IN

Interface:

Gi0/0.20

Direction:

Inbound

Purpose:

Control traffic originating from Student VLAN.

---

## ACL-02

ACL Name:

ACL-IOT-IN

Interface:

Gi0/0.30

Direction:

Inbound

Purpose:

Control traffic originating from IoT VLAN.

---

# 8. ACL-STUDENT-IN Design

## Purpose

Protect:

* Backend Infrastructure
* PostgreSQL
* MQTT Broker
* IoT Devices

from unauthorized Student access.

---

## Allowed Traffic

### Rule S-01

Student → Backend HTTP

TCP/8080

ALLOW

---

### Rule S-02

Student → Backend HTTPS

TCP/443

ALLOW

---

## Denied Traffic

### Rule S-03

Student → PostgreSQL

TCP/5432

DENY

---

### Rule S-04

Student → MQTT

TCP/1883

DENY

---

### Rule S-05

Student → MQTT TLS

TCP/8883

DENY

---

### Rule S-06

Student → SSH

TCP/22

DENY

---

### Rule S-07

Student → VLAN30

ANY

DENY

---

## Security Outcome

Students can use applications.

Students cannot:

* Access Database
* Access MQTT
* Access IoT Devices
* Access SSH

---

# 9. ACL-IOT-IN Design

## Purpose

Restrict IoT communications to authorized services only.

---

## Allowed Traffic

### Rule I-01

IoT → Backend

TCP/8080

ALLOW

---

### Rule I-02

IoT → MQTT Broker

TCP/1883

ALLOW

---

## Denied Traffic

### Rule I-03

IoT → PostgreSQL

TCP/5432

DENY

---

### Rule I-04

IoT → Student VLAN

ANY

DENY

---

### Rule I-05

IoT → ADMIN_PC

ANY

DENY

---

## Security Outcome

IoT devices communicate only with approved services.

Compromised devices cannot move laterally across security zones.

---

# 10. Traffic Flow Enforcement Model

## Student Traffic

```text id="q4z4xq"
Student Device
      |
      v
ACL-STUDENT-IN
      |
      +---- Backend HTTP/HTTPS  -> PERMIT
      |
      +---- PostgreSQL          -> DENY
      |
      +---- MQTT Broker         -> DENY
      |
      +---- IoT Devices         -> DENY
```

---

## IoT Traffic

```text id="nrl21m"
ESP32
  |
  v
ACL-IOT-IN
  |
  +---- MQTT Broker -> PERMIT
  |
  +---- Backend     -> PERMIT
  |
  +---- Database    -> DENY
  |
  +---- Student     -> DENY
```

---

# 11. Security Benefits

## Benefit 01

Database Protection

Students cannot directly access PostgreSQL.

---

## Benefit 02

MQTT Protection

Unauthorized device control attempts are blocked.

---

## Benefit 03

IoT Isolation

IoT devices remain separated from Student devices.

---

## Benefit 04

Malware Containment

Compromised Student devices cannot attack critical infrastructure.

---

## Benefit 05

Lateral Movement Prevention

Compromised IoT devices cannot spread attacks to Student VLAN.

---

## Benefit 06

Reduced Attack Surface

Only required services remain accessible.

---

# 12. Future Scalability

Future project phases may introduce:

* Face Recognition Module
* Fingerprint Recognition Module
* Additional ESP32 Controllers

These devices will be deployed within:

```text id="s83xf6"
VLAN 30 - IOT
```

The existing ACL architecture already supports these additions without major redesign.

---

# 13. ACL Deployment Roadmap

Phase 4 Output:

```text id="e5kgbl"
ACL Architecture
```

↓

Phase 5:

```text id="38g42i"
Cisco ACL Configuration
```

↓

Phase 6:

```text id="l85lmj"
Verification & Security Testing
```

---

# 14. Conclusion

The ACL Architecture Design establishes a structured security enforcement model for the Smart Dormitory Access Control System.

The architecture uses:

* Extended ACLs
* Inbound Filtering
* Source-Based Protection
* Least Privilege Access
* Zero Trust Principles

Two ACLs are sufficient for the current project scope:

* ACL-STUDENT-IN
* ACL-IOT-IN

This design provides strong security while maintaining simplicity, scalability and manageability.

The architecture defined in this document serves as the authoritative blueprint for ACL implementation in Phase 5.
