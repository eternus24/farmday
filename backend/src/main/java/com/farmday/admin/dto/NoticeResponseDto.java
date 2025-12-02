// src/main/java/com/farmday/notice/dto/NoticeResponseDto.java
package com.farmday.admin.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeResponseDto {

    private Long noticeId;
    private String adminId;
    private String title;
    private String content;
    private String isActive;
    private Long viewCount;

    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    private List<NoticeImageDto> images;
}
