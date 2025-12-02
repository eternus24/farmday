// src/main/java/com/farmday/notice/dto/NoticeSaveRequest.java
package com.farmday.admin.dto;

import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeSaveRequest {

    private String title;
    private String content;
    private String isActive; // "Y" / "N"
    private List<NoticeImageDto> images;
}