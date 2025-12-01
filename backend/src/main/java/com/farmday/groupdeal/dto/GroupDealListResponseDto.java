// 경로: backend/src/main/java/com/farmday/groupdeal/dto/GroupDealListResponseDto.java
package com.farmday.groupdeal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

// 공동구매 목록 카드용 DTO
@Data
public class GroupDealListResponseDto {

    private Long groupDealId;
    private String title;
    private String subTitle;

    private BigDecimal originPrice;
    private BigDecimal dealPrice;
    private BigDecimal discountRate;

    private Integer currentQuantity;
    private Integer minMemberCount;

    private String status;
    private Date endAt;

    // 대표 이미지(썸네일)
    private String thumbnailImageUrl;
}
