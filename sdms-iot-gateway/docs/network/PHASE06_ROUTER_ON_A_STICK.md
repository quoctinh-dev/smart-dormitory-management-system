# PHASE 06 - ROUTER-ON-A-STICK

## Objective

Enable communication between multiple VLANs using a single physical interface on the router.

## Trunk Configuration

Switch Port:

Fa0/1

Mode:

Trunk

Protocol:

IEEE 802.1Q

## Router Sub-Interfaces

### VLAN 10

Interface:

GigabitEthernet0/0.10

Gateway:

192.168.10.1

### VLAN 20

Interface:

GigabitEthernet0/0.20

Gateway:

192.168.20.1

### VLAN 30

Interface:

GigabitEthernet0/0.30

Gateway:

192.168.30.1

## Result

Inter-VLAN routing was successfully implemented using Router-on-a-Stick architecture.
