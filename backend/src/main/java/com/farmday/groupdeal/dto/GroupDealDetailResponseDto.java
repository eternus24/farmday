// 경로: backend/src/main/java/com/farmday/groupdeal/dto/GroupDealDetailResponseDto.java
package com.farmday.groupdeal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

// 공동구매 상세 조회용 DTO
@Data
public class GroupDealDetailResponseDto {

    private Long groupDealId;

    private Long productId;
    private String title;
    private String subTitle;
    private String detail; // group_deal_detail

    private BigDecimal originPrice;
    private BigDecimal dealPrice;
    private BigDecimal discountRate;

    private Integer minMemberCount;
    private Integer maxMemberCount;
    private Integer currentQuantity;
    private Integer perUserLimitQty;

    private String status;

    private Date startAt;
    private Date endAt;
    private Date shippingStartDate;
    private Date shippingEndDate;

    // 이미지 목록
    private List<GroupDealImageDto> images;
}
