
# DAY 03 - NETWORK SECURITY & ACCESS CONTROL

# PHASE 6 - VERIFICATION & SECURITY TESTING

---

# 1. Introduction

This phase validates the effectiveness of the implemented network security controls within the Smart Dormitory Access Control System.

The objective is to verify that:

* Network connectivity functions correctly.
* VLAN segmentation operates as designed.
* Inter-VLAN routing works properly.
* Access Control Lists (ACLs) enforce the defined security policies.
* Unauthorized communications are blocked.

---

# 2. Test Environment

## Router

R1_KTX

Cisco 2911

Router-on-a-Stick Architecture

---

## Switch

SW1_KTX

Cisco 2960

---

## VLAN Structure

### VLAN 10 - ADMIN

Network:

192.168.10.0/24

Devices:

* ADMIN_PC
* KTX_SERVER

Gateway:

192.168.10.1

---

### VLAN 20 - STUDENT

Network:

192.168.20.0/24

Devices:

* STUDENT_LAPTOP

Gateway:

192.168.20.1

---

### VLAN 30 - IOT

Network:

192.168.30.0/24

Devices:

* RFID_NODE_01
* ESP32_DOOR_01

Gateway:

192.168.30.1

---

# 3. Implemented ACLs

## ACL-STUDENT-IN

Purpose:

Prevent Student VLAN from accessing IoT VLAN.

Applied Interface:

GigabitEthernet0/0.20

Direction:

Inbound

---

## ACL-IOT-IN

Purpose:

Prevent IoT VLAN from accessing Student VLAN.

Applied Interface:

GigabitEthernet0/0.30

Direction:

Inbound

---

# 4. Test Cases

## TC-01

Student Access to Application Server

Source:

STUDENT_LAPTOP

Destination:

KTX_SERVER

Expected Result:

PASS

Actual Result:

PASS

Status:

SUCCESS

---

## TC-02

Student Access to RFID Node

Source:

STUDENT_LAPTOP

Destination:

RFID_NODE_01

Expected Result:

BLOCKED

Actual Result:

BLOCKED

Status:

SUCCESS

---

## TC-03

Student Access to ESP32 Controller

Source:

STUDENT_LAPTOP

Destination:

ESP32_DOOR_01

Expected Result:

BLOCKED

Actual Result:

BLOCKED

Status:

SUCCESS

---

## TC-04

ACL Counter Verification

Command:

show access-lists

Expected Result:

ACL deny counters increase after blocked traffic attempts.

Actual Result:

Match counter increased.

Status:

SUCCESS

---

# 5. Security Validation Results

The implemented ACL policies successfully restricted direct communication between Student devices and IoT devices.

Students remain capable of accessing authorized system services while being prevented from interacting directly with access control hardware.

This security model significantly reduces the attack surface and limits the impact of compromised student devices.

---

# 6. Conclusion

All security controls defined during the Security Policy Design phase were successfully implemented and verified.

The Smart Dormitory Access Control System now provides:

* Network Segmentation
* Inter-VLAN Routing
* Access Control Enforcement
* Basic Lateral Movement Prevention
* IoT Device Isolation

The network security objectives for Day 03 have been achieved successfully.
