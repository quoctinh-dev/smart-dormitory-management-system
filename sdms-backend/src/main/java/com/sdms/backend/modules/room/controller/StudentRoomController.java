    package com.sdms.backend.modules.room.controller;

    import com.sdms.backend.common.response.ApiResponse;
    import com.sdms.backend.modules.room.dto.response.CurrentRoomResponse;
    import com.sdms.backend.modules.room.service.StudentRoomService;
    import io.swagger.v3.oas.annotations.Operation;
    import io.swagger.v3.oas.annotations.tags.Tag;
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.access.prepost.PreAuthorize;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    /**
     * Controller xử lý các yêu cầu liên quan đến thông tin lưu trú của Sinh viên.
     * * * DESIGN NOTES:
     * 1. Security-First: Không tiếp nhận studentId từ phía Client để ngăn chặn ID Spoofing.
     * Danh tính được giải mã trực tiếp từ JWT và trích xuất qua SecurityContextHolder ở tầng Service.
     * 2. Role-Based Access Control (RBAC): Chỉ cho phép người dùng có quyền ROLE_STUDENT truy cập.
     */
    @RestController
    @RequestMapping("/api/v1/student/room")
    @RequiredArgsConstructor
    @PreAuthorize("hasRole('STUDENT')")
    @Tag(name = "Student Room", description = "API quản lý phòng ở và trạng thái lưu trú dành cho Sinh viên")
    public class StudentRoomController {

        private final StudentRoomService studentRoomService;

        /**
         * Tra cứu thông tin chi tiết về phòng ở hiện tại của sinh viên đang đăng nhập.
         * Luồng xử lý: Get Context -> Verify Active Assignment (OCCUPIED) -> Map To Infrastructure -> Response.
         * * @return ApiResponse bọc dữ liệu cấu trúc hạ tầng từ Building đến Bed kèm theo trạng thái cụ thể.
         */
        @GetMapping("/current")
        @Operation(
                summary = "Tra cứu thông tin phòng hiện tại",
                description = "Trích xuất danh tính từ Token, xác thực trạng thái cư trú và trả về toàn bộ thông tin hạ tầng phòng ở."
        )
        public ApiResponse<CurrentRoomResponse> getCurrentRoom() {
            CurrentRoomResponse response = studentRoomService.getCurrentRoom();
            return ApiResponse.success("Lấy thông tin phòng hiện tại thành công", response);
        }
    }