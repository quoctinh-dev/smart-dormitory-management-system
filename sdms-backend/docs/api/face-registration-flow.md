# Luồng Đang ký và Duyệt Khuôn mặt
**Phiên bản:** 1.0 · **Ngày:** 2026-06-25

Tài liệu này mô tả chi tiết luồng nghiệp vụ end-to-end cho việc đăng ký, xác minh và phê duyệt hồ sơ khuôn mặt, một tính năng cốt lõi cho hệ thống ra vào thông minh.

---

## 1. Bối cảnh nghiệp vụ

Để sử dụng cổng ra vào thông minh bằng nhận dạng khuôn mặt, mỗi sinh viên nội trú cần phải có một "hồ sơ khuôn mặt" (`FaceProfile`) đã được phê duyệt trong hệ thống. Quy trình này bao gồm việc sinh viên tải ảnh lên, Admin duyệt ảnh, và hệ thống AI xử lý ảnh để tạo ra dữ liệu cho việc nhận dạng.

## 2. Các Trạng thái của Hồ sơ Khuôn mặt (`FaceProfileStatus`)

Enum `com.sdms.backend.modules.face.enums.FaceProfileStatus` định nghĩa các trạng thái chính:

| Trạng thái | Mô tả |
| :--- | :--- |
| `PENDING_REGISTRATION` | **Chờ đăng ký:** Trạng thái ban đầu. Sinh viên chưa tải ảnh lên. |
| `PENDING_APPROVAL` | **Chờ duyệt:** Sinh viên đã tải ảnh lên, đang chờ Admin phê duyệt. |
| `APPROVED` | **Đã duyệt:** Admin đã duyệt ảnh. Hồ sơ đã sẵn sàng cho hệ thống AI xử lý. |
| `REJECTED` | **Bị từ chối:** Admin đã từ chối ảnh do không hợp lệ (mờ, không rõ mặt, v.v.). |
| `ACTIVE` | **Đang hoạt động:** Hệ thống AI đã xử lý ảnh thành công và tạo ra vector nhúng. Hồ sơ đã sẵn sàng để sử dụng cho việc ra vào. |
| `REVOKED` | **Bị thu hồi:** Admin đã thu hồi quyền sử dụng hồ sơ này (ví dụ: do sinh viên rời đi, hoặc có vấn đề an ninh). |

## 3. Sơ đồ Quy trình

```
[PENDING_REGISTRATION] ── (Sinh viên tải ảnh) ──> [PENDING_APPROVAL]
        ↑                                                 │
        │ (Admin từ chối)                                 │
        └─────────────── [REJECTED] <──(Admin từ chối)───┘
                                                          │
                                                          ↓ (Admin phê duyệt)
                                                      [APPROVED]
                                                          │
                                                          ↓ (AI xử lý thành công)
                                                      [ACTIVE] ── (Admin thu hồi) ──> [REVOKED]
```

## 4. Quy trình Chi tiết

1.  **Khởi tạo Hồ sơ (Profile Provisioning):**
    *   **Sự kiện kích hoạt:** `StudentCreatedEvent` được phát ra khi một sinh viên mới được tạo.
    *   **Hành động:** `FaceEventListener` lắng nghe sự kiện này và tạo một bản ghi `FaceProfile` mới, liên kết với `studentId` tương ứng. Trạng thái ban đầu là `PENDING_REGISTRATION`.
    *   **Đối chiếu code:** Logic này **chưa được triển khai**. Hiện tại, `FaceProfile` chưa được tự động tạo. Đây là một "khoảng trống" nghiệp vụ.

2.  **Sinh viên Đăng ký (Student Registration):**
    *   **Hành động:** Sinh viên đăng nhập vào app, vào màn hình "Đăng ký khuôn mặt" và tải lên ảnh chân dung.
    *   **API Endpoint:** `POST /api/v1/student/face/register`
    *   **Xử lý Backend (`FaceStudentController` -> `FaceProfileService`):**
        1.  Tìm `FaceProfile` của sinh viên.
        2.  Kiểm tra trạng thái hiện tại (phải là `PENDING_REGISTRATION` hoặc `REJECTED`).
        3.  Tải ảnh lên dịch vụ lưu trữ (Cloudinary).
        4.  Cập nhật `FaceProfile` với đường dẫn ảnh và chuyển trạng thái sang `PENDING_APPROVAL`.
    *   **Đối chiếu code:** Logic này đã được triển khai trong `FaceStudentController` và `FaceProfileServiceImpl`.

3.  **Admin Phê duyệt (Admin Approval):**
    *   **Hành động:** Admin vào trang "Duyệt khuôn mặt", xem danh sách các hồ sơ đang ở trạng thái `PENDING_APPROVAL`. Admin có thể "Duyệt" hoặc "Từ chối".
    *   **API Endpoint (Duyệt):** `POST /api/v1/admin/face/{profileId}/approve`
    *   **API Endpoint (Từ chối):** `POST /api/v1/admin/face/{profileId}/reject`
    *   **Xử lý Backend (`FaceAdminController` -> `FaceProfileService`):**
        *   **Khi duyệt:**
            1.  Chuyển trạng thái `FaceProfile` thành `APPROVED`.
            2.  Phát ra sự kiện `FaceProfileApprovedEvent`.
        *   **Khi từ chối:**
            1.  Cập nhật trạng thái `FaceProfile` thành `REJECTED` kèm lý do.
            2.  Phát ra sự kiện `FaceProfileRejectedEvent` (để gửi thông báo cho sinh viên).
    *   **Đối chiếu code:** Logic này đã được triển khai trong `FaceAdminController` và `FaceProfileServiceImpl`.

4.  **Xử lý AI (AI Processing):**
    *   **Sự kiện kích hoạt:** `FaceProfileApprovedEvent`.
    *   **Hành động:** `FaceAiOrchestrator` lắng nghe sự kiện này.
        1.  Gọi đến một dịch vụ AI bên ngoài (qua `RestAiExtractionAdapter`) để trích xuất vector nhúng từ ảnh đã duyệt.
        2.  Lưu vector nhúng này vào bảng `face_embeddings`.
        3.  Cập nhật trạng thái `FaceProfile` thành `ACTIVE`.
        4.  Phát ra sự kiện `FaceSyncReadyEvent` để thông báo cho các hệ thống khác (ví dụ: hệ thống IoT) rằng hồ sơ này đã sẵn sàng.
    *   **Đối chiếu code:** Logic này đã được triển khai trong `FaceAiOrchestratorImpl`.

## 5. Ghi chú và Khoảng trống

*   **Tự động tạo `FaceProfile`:** Như đã đề cập, hệ thống nên tự động tạo `FaceProfile` ở trạng thái `PENDING_REGISTRATION` khi sinh viên được tạo để quy trình được liền mạch. Cần bổ sung một `EventListener` cho việc này.
*   **Thông báo cho sinh viên:** Cần có các `NotificationEventListener` để lắng nghe các sự kiện `FaceProfileRejectedEvent`, `FaceProfileApprovedEvent`, `FaceSyncReadyEvent` và gửi thông báo (email/push notification) cho sinh viên để họ biết tiến trình đăng ký của mình.
