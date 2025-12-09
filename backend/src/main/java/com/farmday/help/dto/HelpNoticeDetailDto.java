package com.farmday.help.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.farmday.admin.dto.NoticeImageDto;

import lombok.Data;

@Data
public class HelpNoticeDetailDto {
    private Long noticeId;
    private String adminId;
    private String title;
    private String content;
    private String isActive;
    private Integer viewCount;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    // 이미지 목록
    private List<NoticeImageDto> images;
}
