// src/main/java/com/farmday/help/controller/HelpNoticeController.java
package com.farmday.help.controller;

import com.farmday.help.dto.HelpNoticeDetailDto;
import com.farmday.help.dto.HelpNoticeDto;
import com.farmday.help.service.HelpNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/help")
@RequiredArgsConstructor
@CrossOrigin("*")
public class HelpNoticeController {

    private final HelpNoticeService noticeService;

    // 🔹 공지 리스트 (프론트: /api/help/notices?page=0&size=5)
    @GetMapping("/notices")
    public ResponseEntity<List<HelpNoticeDto>> getNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        List<HelpNoticeDto> list = noticeService.getNoticeList(page, size);
        return ResponseEntity.ok(list);
    }

    // 🔹 공지 상세 (프론트: /help/notice/{id} 에서 사용할 예정)
    @GetMapping("/notice/{noticeId}")
    public ResponseEntity<HelpNoticeDto> getNotice(
            @PathVariable Long noticeId
    ) {
        HelpNoticeDto notice = noticeService.getNotice(noticeId);
        if (notice == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notice);
    }

    // 🔥 상세 + 이미지
    @GetMapping("/notices/{noticeId}")
    public ResponseEntity<HelpNoticeDetailDto> getNoticeDetail(
            @PathVariable Long noticeId
    ) {
        HelpNoticeDetailDto dto = noticeService.getNoticeDetail(noticeId);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }
}