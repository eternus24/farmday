// src/main/java/com/farmday/notice/controller/AdminNoticeController.java
package com.farmday.admin.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.farmday.admin.dto.NoticeResponseDto;
import com.farmday.admin.dto.NoticeSaveRequest;
import com.farmday.admin.service.NoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final NoticeService noticeService;

    // 관리자 권한 체크 (프로젝트 상황에 맞게 수정 가능)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<NoticeResponseDto> getNotices() {
        return noticeService.getAllNotices();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public NoticeResponseDto createNotice(
            Authentication authentication,
            @RequestBody NoticeSaveRequest request
    ) {
        // 로그인된 관리자 ID (userId) 사용
        String adminId = authentication != null ? authentication.getName() : null;
        return noticeService.createNotice(adminId, request);
    }

    @PutMapping("/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public NoticeResponseDto updateNotice(
            @PathVariable Long noticeId,
            @RequestBody NoticeSaveRequest request
    ) {
        return noticeService.updateNotice(noticeId, request);
    }

    @DeleteMapping("/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteNotice(@PathVariable Long noticeId) {
        noticeService.deleteNotice(noticeId);
    }
}