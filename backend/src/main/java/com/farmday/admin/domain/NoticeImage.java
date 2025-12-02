// src/main/java/com/farmday/notice/domain/NoticeImage.java
package com.farmday.admin.domain;

import java.time.LocalDateTime;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeImage {

    private Long imageId;
    private Long noticeId;
    private String imageUrl;
    private Integer sortOrder;

    private LocalDateTime createdDate;
}
