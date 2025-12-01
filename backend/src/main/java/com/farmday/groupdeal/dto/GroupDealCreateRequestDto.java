// 경로: backend/src/main/java/com/farmday/groupdeal/dto/GroupDealCreateRequestDto.java
package com.farmday.groupdeal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

// 생산자가 공동구매 등록할 때 사용하는 요청 DTO
@Data
public class GroupDealCreateRequestDto {

    // 🔥 여기 추가 (PK)
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
    private Integer perUserLimitQty;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date startAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date endAt;

    private Date shippingStartDate;
    private Date shippingEndDate;

    // 로그인한 판매자 ID를 서비스에서 세팅해줄 것
    private String createdBy;

    // 이미지 URL 리스트(있으면 GROUP_DEAL_IMAGE에 같이 INSERT)
    private List<String> imageUrls;
}
