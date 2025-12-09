// src/main/java/com/farmday/help/dto/NoticeDto.java
package com.farmday.help.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HelpNoticeDto {

    private Long noticeId;      // PK
    private String adminId;     // 작성 관리자 ID
    private String title;       // 제목
    private String content;     // 내용
    private String isActive;    // 노출 여부 (Y/N)
    private Integer viewCount;  // 조회수
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}