package com.farmday.admin.controller;

import com.farmday.admin.dto.AdminUserDetailDto;
import com.farmday.admin.dto.AdminUserListResponse;
import com.farmday.admin.service.AdminUserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    // 유저 목록
    @GetMapping
    public ResponseEntity<AdminUserListResponse> listUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String blocked   // 'Y' / 'N'
    ) {
        AdminUserListResponse resp =
                adminUserService.getUsers(page, size, keyword, role, blocked);
        return ResponseEntity.ok(resp);
    }

    // 유저 상세
    @GetMapping("/{userNo}")
    public ResponseEntity<AdminUserDetailDto> getUser(@PathVariable Long userNo) {
        return ResponseEntity.ok(adminUserService.getUserDetail(userNo));
    }

    // 유저 차단
    @PostMapping("/{userNo}/block")
    public ResponseEntity<Void> blockUser(
            @PathVariable Long userNo,
            @RequestBody BlockRequest req
    ) {
        adminUserService.blockUser(userNo, req.getReason());
        return ResponseEntity.ok().build();
    }

    // 유저 차단 해제
    @PostMapping("/{userNo}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable Long userNo) {
        adminUserService.unblockUser(userNo);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class BlockRequest {
        private String reason;
    }
}