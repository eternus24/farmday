// src/main/java/com/farmday/notice/domain/Notice.java
package com.farmday.admin.domain;

import java.time.LocalDateTime;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notice {

    private Long noticeId;
    private String adminId;      // 작성 관리자 ID (USER.userId)
    private String title;
    private String content;
    private String isActive;     // Y / N
    private Long viewCount;

    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}