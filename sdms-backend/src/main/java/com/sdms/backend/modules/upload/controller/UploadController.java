package com.sdms.backend.modules.upload.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.upload.dto.response.UploadResponse;
import com.sdms.backend.modules.upload.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
@Tag(name = "Upload Controller", description = "API endpoint để quản lý việc upload tệp tin lên Cloudinary")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @Operation(
            summary = "Upload Avatar",
            description = "Upload một tệp hình ảnh làm ảnh đại diện. Hệ thống sẽ tự động lưu vào thư mục 'avatars' trên Cloudinary."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Upload thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Tệp tin không hợp lệ hoặc bị rỗng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "415", description = "Định dạng tệp không được hỗ trợ (chỉ chấp nhận ảnh)")
    })
    @PostMapping(
            value = "/avatar",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<UploadResponse>> uploadAvatar(
            @Parameter(
                    description = "Tệp hình ảnh cần upload (jpg, png, v.v.)",
                    required = true,
                    content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE)
            )
            @RequestParam("file") MultipartFile file
    ) {

        String url = cloudinaryService.uploadFile(file, "avatars");

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Avatar uploaded successfully",
                new UploadResponse(url)
        ));
    }
}