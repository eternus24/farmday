// src/main/java/com/farmday/groupdeal/domain/GroupDealDetailDto.java
package com.farmday.groupdeal.domain;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GroupDealDetailDto {

    private Long groupDealId;
    private Long productId;
    private Long detailId;

    private String productName;        // 전남 해남 친환경 배추 3kg
    private String region;             // 전남 해남
    private List<String> tags;         // [2인 공동구매], [무료배송] 등
    private List<String> imageUrls;    // 상단 큰 이미지 슬라이더

    private BigDecimal originPrice;    // 원가 26,780원
    private BigDecimal dealPrice;      // 공구가 9,800원
    private BigDecimal discountRate;   // 63%

    private Double rating;             // 4.8
    private Integer reviewCount;       // 48
    private Integer soldCount;         // 156개 판매

    private LocalDateTime endAt;       // 오늘 23:59 마감
    private Integer currentMemberCount;
    private Integer minMemberCount;

    // 시세 비교 영역 표시용 (필요하면 가격 파트에서 채워넣기)
    private BigDecimal marketPrice;    // 도매시세 12,000원
    private BigDecimal priceDiff;      // 시세 - 공구가
    private String priceDiffText;      // "시세보다 2,200원 더 저렴!"

    // 배송 정보
    private String deliveryText;       // "12/25(수) 도착 예정"
    private String sellerName;         // 해남친환경농장
    private String productCode;        // 상품번호: 1234567
}
