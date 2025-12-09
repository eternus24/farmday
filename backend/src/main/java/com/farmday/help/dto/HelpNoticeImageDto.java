package com.farmday.help.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class HelpNoticeImageDto {

    private Long imageId;
    private Long noticeId;
    private String imageUrl;
    private Integer sortOrder;
    private LocalDateTime createdDate;
    
}
