# PHASE 05 - Verification & Testing

## Existing Architecture

Student devices currently access the network through Home Gateway NAT.

WAN:
192.168.1.30

LAN:
192.168.25.1

## Issue

The NAT architecture is suitable for learning networking fundamentals but does not align with the VLAN-based enterprise architecture designed for the Smart Dormitory system.

## Proposed Architecture

VLAN 10
192.168.10.0/24

VLAN 20
192.168.20.0/24

VLAN 30
192.168.30.0/24

Router-on-a-Stick will be used to provide inter-VLAN routing.

## Decision

The VLAN architecture will become the primary network architecture for the Smart Dormitory system.

## Architecture Decision

The Smart Dormitory network architecture will migrate from the Home Gateway NAT model to a VLAN-based enterprise architecture.

Reason:

* Better scalability
* Better security
* Easier management
* Suitable for real-world deployment
* Consistent with Smart Building network design principles

The Home Gateway NAT model was retained in DAY 01 for networking fundamentals, but VLAN segmentation will be the primary architecture from DAY 02 onward.
