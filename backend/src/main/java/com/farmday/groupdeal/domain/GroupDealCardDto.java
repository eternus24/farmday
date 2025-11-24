// src/main/java/com/farmday/groupdeal/domain/GroupDealCardDto.java
package com.farmday.groupdeal.domain;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class GroupDealCardDto {

    private Long groupDealId;
    private Long productId;

    private String productName;        // 예: 친환경 배추 3kg
    private String region;             // 예: 전남 해남
    private String mainTag;            // 예: [2인 공동구매] or [첫구매전용]
    private String imageUrl;           // 썸네일 이미지 URL (없으면 null)

    private BigDecimal originPrice;    // 원가
    private BigDecimal dealPrice;      // 공구가
    private BigDecimal discountRate;   // 할인율

    private Integer currentMemberCount;
    private Integer minMemberCount;

    private LocalDateTime endAt;       // 마감 시간

    private Double rating;             // 별점
    private Integer reviewCount;       // 리뷰수
}
