package com.farmday.product.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class VisitLogDTO {

    private Long visitId;//방문ID
    private Long storeId;//스토어 ID
    private String userId;//유저 ID
    private String ipAddress;//방문 IP
    private String userAgent;//브라우저 정보
    private String deviceType;//pc, mobile, tablet
    private LocalDateTime visitedAt;
}
