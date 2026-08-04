# BẢN ĐỒ TÍNH NĂNG (FEATURE MAP)

| ID | Tên chức năng (Business Goal) | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|---|---|---|---|---|---|---|---|
| F001 | Tải lên tài liệu minh chứng | PUBLIC | ApplicationController | applicationService | N/A | `/register` | `/api/v1/applications/{applicationId}/documents` |
| F002 | Nộp đơn đăng ký chính thức | PUBLIC | ApplicationController | applicationService | N/A | `/register` | `/api/v1/applications/{applicationId}/submit` |
| F003 | Sinh viên nộp lại tài liệu minh chứng bị sai | PUBLIC | ApplicationController | applicationService | N/A | `/register` | `/api/v1/applications/{applicationId}/documents/{documentId}/resubmit` |
| F004 | Xem chi tiết đơn đăng ký | PUBLIC | ApplicationController | applicationService | N/A | `/register` | `/api/v1/applications/{applicationId}` |
| F005 | Tra cứu đơn đăng ký theo MSSV | PUBLIC | ApplicationController | applicationService | N/A | `/register` | `/api/v1/applications/status` |
| F006 | Bắt đầu duyệt hồ sơ (Chuyển sang UNDER_REVIEW) | PUBLIC | ApplicationReviewController | reviewService, paymentService | N/A | `/admin/applications/review` | `/api/v1/admin/applications/{applicationId}/start-review` |
| F007 | Xác minh tài liệu đính kèm (CCCD, ảnh chân dung...) | PUBLIC | ApplicationReviewController | reviewService, paymentService | N/A | `/admin/applications/review` | `/api/v1/admin/applications/documents/{documentId}/verify` |
| F008 | Phê duyệt đơn đăng ký nội trú | PUBLIC | ApplicationReviewController | reviewService, paymentService | N/A | `/admin/applications/review` | `/api/v1/admin/applications/{applicationId}/approve` |
| F009 | Từ chối đơn đăng ký nội trú | PUBLIC | ApplicationReviewController | reviewService, paymentService | N/A | `/admin/applications/review` | `/api/v1/admin/applications/{applicationId}/reject` |
| F010 | Yêu cầu sinh viên nộp lại minh chứng sai | PUBLIC | ApplicationReviewController | reviewService, paymentService | N/A | `/admin/applications/review` | `/api/v1/admin/applications/{applicationId}/request-revision` |
| F011 | Xác nhận thu tiền giữ chỗ trực tiếp (Tiền mặt) | PUBLIC | ApplicationReviewController | reviewService, paymentService | N/A | `/admin/applications/review` | `/api/v1/admin/applications/{applicationId}/confirm-payment` |
| F012 | Kích hoạt tài khoản sinh viên | PUBLIC | AuthController | authService, userService | N/A | `N/A` | `/api/v1/auth/activate` |
| F013 | Đăng nhập | PUBLIC | AuthController | authService, userService | N/A | `/admin/login` | `/api/v1/auth/login` |
| F014 | Đăng xuất | PUBLIC | AuthController | authService, userService | N/A | `N/A` | `/api/v1/auth/logout` |
| F015 | Đổi mật khẩu | PUBLIC | AuthController | authService, userService | N/A | `N/A` | `/api/v1/auth/change-password` |
| F016 | Quên mật khẩu | PUBLIC | AuthController | authService, userService | N/A | `N/A` | `/api/v1/auth/forgot-password` |
| F017 | Khôi phục mật khẩu | PUBLIC | AuthController | authService, userService | N/A | `N/A` | `/api/v1/auth/reset-password` |
| F018 | Get /api/v1/dashboard/stats | ADMIN | DashboardController | dashboardService | N/A | `/admin` | `/api/v1/dashboard/stats` |
| F019 | Lấy thống kê tổng quan (Dashboard) | ADMIN | DashboardController | dashboardService | N/A | `/admin` | `/api/v1/dashboard/expiring-assignments` |
| F020 | Duyệt hồ sơ khuôn mặt | PUBLIC | FaceAdminController | faceProfileService | N/A | `/admin/faces/approve` | `/api/v1/admin/faces/{profileId}/approve` |
| F021 | Từ chối hồ sơ khuôn mặt | PUBLIC | FaceAdminController | faceProfileService | N/A | `/admin/faces/approve` | `/api/v1/admin/faces/{profileId}/reject` |
| F022 | Thu hồi hồ sơ khuôn mặt | PUBLIC | FaceAdminController | faceProfileService | N/A | `/admin/faces/approve` | `/api/v1/admin/faces/{profileId}/revoke` |
| F023 | Duyệt thay đổi khuôn mặt | PUBLIC | FaceAdminController | faceProfileService | N/A | `/admin/faces/approve` | `/api/v1/admin/faces/{profileId}/replacements/approve` |
| F024 | Từ chối thay đổi khuôn mặt | PUBLIC | FaceAdminController | faceProfileService | N/A | `/admin/faces/approve` | `/api/v1/admin/faces/{profileId}/replacements/reject` |
| F025 | Lấy danh sách khuôn mặt chờ duyệt | PUBLIC | FaceAdminController | faceProfileService | N/A | `/admin/faces/approve` | `/api/v1/admin/faces/pending` |
| F026 | Đăng ký khuôn mặt mới | STUDENT | FaceStudentController | faceProfileService, faceVerificationService, cloudinaryService | N/A | `/student/*` | `/api/v1/students/me/faceconsumes = MediaType.MULTIPART_FORM_DATA_VALUE` |
| F027 | Lấy lịch sử xác thực khuôn mặt | STUDENT | FaceStudentController | faceProfileService, faceVerificationService, cloudinaryService | N/A | `/student/*` | `/api/v1/students/me/face/verifications` |
| F028 | Lấy lịch sử gửi thông báo | ADMIN | AdminNotificationController | N/A | N/A | `/admin/*` | `/api/v1/admin/notifications/delivery-logs` |
| F029 | Gửi thông báo hàng loạt | ADMIN | AdminNotificationController | N/A | N/A | `/admin/*` | `/api/v1/admin/notifications/broadcast` |
| F030 | Lấy số lượng thông báo chưa đọc | PUBLIC | NotificationController | inAppNotificationService | N/A | `N/A` | `/api/v1/notifications/unread-count` |
| F031 | Đánh dấu thông báo đã đọc | PUBLIC | NotificationController | inAppNotificationService | N/A | `N/A` | `/api/v1/notifications/{id}/read` |
| F032 | Đánh dấu tất cả thông báo đã đọc | PUBLIC | NotificationController | inAppNotificationService | N/A | `N/A` | `/api/v1/notifications/read-all` |
| F033 | Gửi báo cáo sự cố | PUBLIC | NotificationController | inAppNotificationService | N/A | `N/A` | `/api/v1/notifications/issues` |
| F034 | Lấy hóa đơn theo hồ sơ đăng ký | STUDENT | BillController | billService | N/A | `N/A` | `/api/v1/bills/application/{applicationId}` |
| F035 | Lấy lịch sử hóa đơn của tôi (danh sách) | STUDENT | BillController | billService | N/A | `N/A` | `/api/v1/bills/me` |
| F036 | Lấy lịch sử hóa đơn của tôi (phân trang - Mobile App) | STUDENT | BillController | billService | N/A | `N/A` | `/api/v1/bills/me/paged` |
| F037 | Tạo hóa đơn thủ công (Đền bù, Phạt vi phạm) | STUDENT | BillController | billService | N/A | `N/A` | `/api/v1/bills/manual` |
| F038 | Sinh viên thanh toán online (VNPay, MoMo, Bank Transfer) | STUDENT | PaymentController | paymentService | N/A | `N/A` | `/api/v1/payments/online` |
| F039 | Admin/Staff xác nhận thanh toán tiền mặt | STUDENT | PaymentController | paymentService | N/A | `N/A` | `/api/v1/payments/cash/approve` |
| F040 | Lấy danh sách phòng để ghi chỉ số điện nước | PUBLIC | UtilityUsageController | utilityUsageManagementService | N/A | `/admin/*` | `/api/v1/admin/utilities/rooms` |
| F041 | Lưu chỉ số điện nước | PUBLIC | UtilityUsageController | utilityUsageManagementService | N/A | `/admin/*` | `/api/v1/admin/utilities/record` |
| F042 | Hủy chốt chỉ số điện nước | PUBLIC | UtilityUsageController | utilityUsageManagementService | N/A | `/admin/*` | `/api/v1/admin/utilities/record` |
| F043 | Kích hoạt đợt (Tự động tắt các đợt khác) | ADMIN | RegistrationAdminController | N/A | N/A | `/admin/*` | `/api/v1/admin/registration-periods/{id}/activate` |
| F044 | Tắt đợt đang hoạt động | ADMIN | RegistrationAdminController | N/A | N/A | `/admin/*` | `/api/v1/admin/registration-periods/{id}/deactivate` |
| F045 | Cập nhật thông quyết đợt | ADMIN | RegistrationAdminController | N/A | N/A | `/admin/*` | `/api/v1/admin/registration-periods/{id}` |
| F046 | Xóa đợt đăng ký (Hard Delete) | ADMIN | RegistrationAdminController | N/A | N/A | `/admin/*` | `/api/v1/admin/registration-periods/{id}` |
| F047 | Yêu cầu gửi mã OTP để xác thực Email trước khi đăng ký | PUBLIC | RegistrationController | registrationService, registrationOtpService | N/A | `N/A` | `/api/v1/registrations/request-otp` |
| F048 | Kiểm tra điều kiện đăng ký của sinh viên (Kèm xác thực OTP) | PUBLIC | RegistrationController | registrationService, registrationOtpService | N/A | `N/A` | `/api/v1/registrations/check-eligibility` |
| F049 | Lấy thông tin đợt đăng ký đang mở | PUBLIC | RegistrationController | registrationService, registrationOtpService | N/A | `N/A` | `/api/v1/registrations/active` |
| F050 | Xem danh sách sinh viên đủ điều kiện của một đợt (Có phân trang & Tìm kiếm) | ADMIN | RegistrationEligibilityController | N/A | N/A | `/admin/*` | `/api/v1/admin/registration-periods/{periodId}/eligibilities` |
| F051 | Xóa một sinh viên khỏi danh sách đủ điều kiện | ADMIN | RegistrationEligibilityController | N/A | N/A | `/admin/*` | `/api/v1/admin/registration-periods/{periodId}/eligibilities/{eligibilityId}` |
| F052 | Xóa toàn bộ sinh viên khỏi danh sách đủ điều kiện | ADMIN | RegistrationEligibilityController | N/A | N/A | `/admin/*` | `/api/v1/admin/registration-periods/{periodId}/eligibilities` |
| F053 | Lấy danh sách giường theo phòng | ADMIN | BedController | bedService | N/A | `/admin/*` | `/api/v1/admin/beds/room/{roomId}` |
| F054 | Tự động sinh giường cho phòng dựa trên sức chứa (Capacity) | ADMIN | BedController | bedService | N/A | `/admin/*` | `/api/v1/admin/beds/room/{roomId}/auto-generate` |
| F055 | Cập nhật trạng thái giường | ADMIN | BedController | bedService | N/A | `/admin/*` | `/api/v1/admin/beds/{bedId}/status` |
| F056 | Xóa giường (Hard Delete) | ADMIN | BedController | bedService | N/A | `/admin/*` | `/api/v1/admin/beds/{bedId}` |
| F057 | Lấy chi tiết tòa nhà theo ID | ADMIN | BuildingController | buildingService | N/A | `/admin/*` | `/api/v1/admin/buildings/{id}` |
| F058 | Cập nhật thông tin tòa nhà | ADMIN | BuildingController | buildingService | N/A | `/admin/*` | `/api/v1/admin/buildings/{id}` |
| F059 | Thay đổi trạng thái tòa nhà | ADMIN | BuildingController | buildingService | N/A | `/admin/*` | `/api/v1/admin/buildings/{id}/status` |
| F060 | Xóa cứng tòa nhà (Draft Only) | ADMIN | BuildingController | buildingService | N/A | `/admin/*` | `/api/v1/admin/buildings/{id}` |
| F061 | Tra cứu sinh viên nhận phòng | PUBLIC | CheckInController | checkInService | N/A | `/admin/*` | `/api/v1/admin/check-in/search` |
| F062 | Xác nhận nhận phòng | PUBLIC | CheckInController | checkInService | N/A | `/admin/*` | `/api/v1/admin/check-in/{assignmentId}` |
| F063 | Lấy chi tiết tầng | ADMIN | FloorController | floorService | N/A | `/admin/*` | `/api/v1/admin/floors/{floorId}` |
| F064 | Lấy danh sách tầng theo tòa nhà | ADMIN | FloorController | floorService | N/A | `/admin/*` | `/api/v1/admin/floors/building/{buildingId}` |
| F065 | Cập nhật chính sách cư trú của tầng | ADMIN | FloorController | floorService | N/A | `/admin/*` | `/api/v1/admin/floors/{floorId}` |
| F066 | Xóa cứng tầng (Draft Only) | ADMIN | FloorController | floorService | N/A | `/admin/*` | `/api/v1/admin/floors/{floorId}` |
| F067 | Get /api/v1/admin/housing-assignments/active/bed/{bedId} | PUBLIC | HousingAssignmentAdminController | N/A | N/A | `/admin/*` | `/api/v1/admin/housing-assignments/active/bed/{bedId}` |
| F068 | Xem kết quả xếp phòng | PUBLIC | PublicRoomController | N/A | N/A | `/student/*` | `/api/v1/student/room-result/assignment/{applicationId}` |
| F069 | Lấy chi tiết phòng | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/{roomId}` |
| F070 | Lấy danh sách phòng theo tầng | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/floor/{floorId}` |
| F071 | Cập nhật thông tin phòng | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/{roomId}` |
| F072 | Thay đổi trạng thái phòng | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/{roomId}/status` |
| F073 | Gán chức vụ trong phòng cho sinh viên (Trưởng phòng/Phó phòng) | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/assignments/{assignmentId}/role` |
| F074 | Thống kê tỷ lệ lấp đầy phòng (Dashboard) | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/analytics/occupancy` |
| F075 | Gợi ý danh sách phòng trống để điều chuyển khẩn cấp | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/analytics/emergency-relocation` |
| F076 | Thống kê rủi ro tài chính / Nợ cước (Dashboard) | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/analytics/revenue-at-risk` |
| F077 | Báo cáo bảo trì phòng (Dashboard) | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/analytics/maintenance-report` |
| F078 | Xóa cứng phòng (Draft Only) | ADMIN | RoomController | roomService | N/A | `/admin/rooms` | `/api/v1/admin/rooms/{roomId}` |
| F079 | Lấy danh sách phòng trống | STUDENT | RoomStudentController | N/A | N/A | `/student/*` | `/api/v1/student/rooms/available` |
| F080 | Lấy đếm ngược thanh toán | STUDENT | StudentAssignmentCountdownController | systemConfigService | N/A | `/student/*` | `/api/v1/student/assignments/countdown` |
| F081 | Get /api/v1/student/room/current | STUDENT | StudentRoomController | studentRoomService | N/A | `/student/*` | `/api/v1/student/room/current` |
| F082 | Xem lịch sử theo sinh viên | STUDENT | AccessHistoryController | manualSyncService | N/A | `/student/*` | `/api/v1/access/history/student/{studentId}` |
| F083 | Xem lịch sử của tôi | STUDENT | AccessHistoryController | manualSyncService | N/A | `N/A` | `/api/v1/access/history/me` |
| F084 | Xem lịch sử theo cổng | STUDENT | AccessHistoryController | manualSyncService | N/A | `N/A` | `/api/v1/access/history/gate/{gateId}` |
| F085 | Xem lịch sử theo tòa nhà | STUDENT | AccessHistoryController | manualSyncService | N/A | `N/A` | `/api/v1/access/history/building/{buildingId}` |
| F086 | Lấy danh sách sinh viên đang ở ngoài | STUDENT | AccessHistoryController | manualSyncService | N/A | `N/A` | `/api/v1/access/history/outside` |
| F087 | Đồng bộ trạng thái | STUDENT | AccessHistoryController | manualSyncService | N/A | `N/A` | `/api/v1/access/history/sync-state` |
| F088 | Cập nhật trạng thái | PUBLIC | CurfewPolicyController | N/A | N/A | `N/A` | `/api/v1/access/curfew-policies/{id}/status` |
| F089 | Xóa chính sách | PUBLIC | CurfewPolicyController | N/A | N/A | `N/A` | `/api/v1/access/curfew-policies/{id}` |
| F090 | Get /api/v1/curfew-requests/me | STUDENT | CurfewRequestController | curfewRequestService | N/A | `N/A` | `/api/v1/curfew-requests/me` |
| F091 | Patch /api/v1/curfew-requests/{id} | ADMIN | CurfewRequestController | curfewRequestService | N/A | `N/A` | `/api/v1/curfew-requests/{id}` |
| F092 | Duyệt hàng loạt | ADMIN | CurfewRequestController | curfewRequestService | N/A | `N/A` | `/api/v1/curfew-requests/bulk/approve` |
| F093 | Từ chối hàng loạt | ADMIN | CurfewRequestController | curfewRequestService | N/A | `N/A` | `/api/v1/curfew-requests/bulk/reject` |
| F094 | Lấy thông tin một cổng | ADMIN | GateController | gateService | N/A | `N/A` | `/api/v1/gates/{id}` |
| F095 | Cập nhật cổng | ADMIN | GateController | gateService | N/A | `N/A` | `/api/v1/gates/{id}` |
| F096 | Xóa cổng | ADMIN | GateController | gateService | N/A | `N/A` | `/api/v1/gates/{id}` |
| F097 | Xác thực thẻ RFID | PUBLIC | IotVerificationController | accessEvaluationService, faceVerificationService, eligibilityEvaluationService, cloudinaryService, systemConfigService, inAppNotificationService | N/A | `N/A` | `/api/v1/smartaccess/verify/card` |
| F098 | Lấy danh sách thẻ trắng | PUBLIC | IotVerificationController | accessEvaluationService, faceVerificationService, eligibilityEvaluationService, cloudinaryService, systemConfigService, inAppNotificationService | N/A | `N/A` | `/api/v1/smartaccess/rfid-whitelist` |
| F099 | Xác thực khuôn mặt | PUBLIC | IotVerificationController | accessEvaluationService, faceVerificationService, eligibilityEvaluationService, cloudinaryService, systemConfigService, inAppNotificationService | N/A | `N/A` | `/api/v1/smartaccess/verify/face` |
| F100 | Xác thực mã PIN | PUBLIC | IotVerificationController | accessEvaluationService, faceVerificationService, eligibilityEvaluationService, cloudinaryService, systemConfigService, inAppNotificationService | N/A | `N/A` | `/api/v1/smartaccess/verify/pin` |
| F101 | Báo lỗi phần cứng | PUBLIC | IotVerificationController | accessEvaluationService, faceVerificationService, eligibilityEvaluationService, cloudinaryService, systemConfigService, inAppNotificationService | N/A | `N/A` | `/api/v1/smartaccess/report/hardware-error` |
| F102 | Đồng bộ log offline | PUBLIC | IotVerificationController | accessEvaluationService, faceVerificationService, eligibilityEvaluationService, cloudinaryService, systemConfigService, inAppNotificationService | N/A | `N/A` | `/api/v1/smartaccess/offline-log-batch` |
| F103 | Lấy mã PIN | ADMIN | RoomPinController | roomPinService | N/A | `N/A` | `/api/v1/room-pins/{roomId}` |
| F104 | Reset mã PIN | ADMIN | RoomPinController | roomPinService | N/A | `N/A` | `/api/v1/room-pins/{roomId}/reset` |
| F105 | Tạo PIN hàng loạt | ADMIN | RoomPinController | roomPinService | N/A | `N/A` | `/api/v1/room-pins/bulk-generate` |
| F106 | Reset PIN toàn bộ hệ thống | ADMIN | RoomPinController | roomPinService | N/A | `N/A` | `/api/v1/room-pins/bulk-reset` |
| F107 | Cập nhật trạng thái | PUBLIC | TimeWindowPolicyController | N/A | N/A | `N/A` | `/api/v1/access/time-window-policies/{id}/status` |
| F108 | Xóa chính sách | PUBLIC | TimeWindowPolicyController | N/A | N/A | `N/A` | `/api/v1/access/time-window-policies/{id}` |
| F109 | Lấy danh sách yêu cầu đổi phòng | PUBLIC | AdminChangeRoomController | changeRoomService | N/A | `/admin/*` | `/api/v1/admin/change-room/requests` |
| F110 | Xử lý yêu cầu đổi phòng | PUBLIC | AdminChangeRoomController | changeRoomService | N/A | `/admin/*` | `/api/v1/admin/change-room/requests/{id}/process` |
| F111 | Di dời sinh viên để bảo trì | PUBLIC | AdminChangeRoomController | changeRoomService | N/A | `/admin/*` | `/api/v1/admin/change-room/maintenance/relocate` |
| F112 | Xét duyệt đơn trả phòng hàng loạt | PUBLIC | CheckoutRequestAdminController | checkoutRequestService | N/A | `/admin/*` | `/api/v1/admin/checkout-requests/bulk-review` |
| F113 | Xét duyệt đơn trả phòng | PUBLIC | CheckoutRequestAdminController | checkoutRequestService | N/A | `/admin/*` | `/api/v1/admin/checkout-requests/{requestId}/review` |
| F114 | Phê duyệt hoặc từ chối đơn gia hạn | PUBLIC | StayExtensionAdminController | stayExtensionService | N/A | `/admin/*` | `/api/v1/admin/extensions/{id}/status` |
| F115 | Lấy thông tin đơn gia hạn | STUDENT | StayExtensionController | stayExtensionService | N/A | `/student/*` | `/api/v1/students/extensions/my-application` |
| F116 | Lấy hồ sơ sinh viên hiện tại | ADMIN | StudentController | studentService | N/A | `/student/*` | `/api/v1/students/me` |
| F117 | Cập nhật hồ sơ sinh viên hiện tại | STUDENT | StudentController | studentService | N/A | `/student/*` | `/api/v1/students/me` |
| F118 | Lấy hồ sơ sinh viên bằng ID | STUDENT | StudentController | studentService | N/A | `/student/*` | `/api/v1/students/{id}/profile` |
| F119 | Cập nhật hồ sơ sinh viên | ADMIN | StudentController | studentService | N/A | `/student/*` | `/api/v1/students/{id}` |
| F120 | Gán thẻ RFID cho sinh viên | ADMIN | StudentController | studentService | N/A | `/student/*` | `/api/v1/students/{studentId}/rfid` |
| F121 | Cập nhật cấu hình | ADMIN | SystemConfigController | systemConfigService | N/A | `/admin/*` | `/api/v1/admin/system-configs/{key}` |
| F122 | Khóa/Mở khóa tài khoản | ADMIN | AdminAccountController | userService | N/A | `/admin/*` | `/api/v1/admin/accounts/{id}/toggle-lock` |
| F123 | Thêm tài khoản Staff mới | ADMIN | AdminAccountController | userService | N/A | `/admin/*` | `/api/v1/admin/accounts/staff` |
| F124 | Get /api/v1/users/me | PUBLIC | UserController | userService | N/A | `N/A` | `/api/v1/users/me` |
