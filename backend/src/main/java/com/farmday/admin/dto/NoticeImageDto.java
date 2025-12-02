// src/main/java/com/farmday/notice/dto/NoticeImageDto.java
package com.farmday.admin.dto;

import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeImageDto {

    private Long imageId;
    private Long noticeId;
    private String imageUrl;
    private Integer sortOrder;
    private LocalDateTime createdDate;
}
