# Auth Module Architecture Design

## 1. Role Permission Mapping Responsibility
SDMS sử dụng Hybrid Authorization Architecture: RBAC tại Auth Layer, Permission-Based Authorization tại Business Layer.

Auth Module chịu trách nhiệm:
* **Role Definition**: Định nghĩa các Role toàn cục (Ví dụ: `ADMIN`, `STAFF`, `STUDENT`).
* **User Role Assignment**: Quản lý việc gán Role cho từng User cụ thể.
* **Permission Assignment**: Quản lý bản đồ (mapping) ánh xạ giữa Role và Permission.

Ví dụ về Mapping tại Auth Module:
* `ADMIN`
  $\rightarrow$ `REMOTE_UNLOCK`
  $\rightarrow$ `EMERGENCY_OVERRIDE`
* `STAFF`
  $\rightarrow$ `REMOTE_UNLOCK`
  $\rightarrow$ `VIEW_ACCESS_HISTORY`
