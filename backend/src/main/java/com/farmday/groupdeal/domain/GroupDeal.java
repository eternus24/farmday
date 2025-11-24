// src/main/java/com/farmday/groupdeal/domain/GroupDeal.java
package com.farmday.groupdeal.domain;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class GroupDeal {
    private Long groupDealId;          // PK
    private Long productId;            // PRODUCT.product_id
    private Long detailId;             // PRODUCT_DETAIL.detail_id

    private String title;              // 카드/상세 상단 제목
    private String subTitle;           // 부제/설명

    private BigDecimal originPrice;    // 원래 가격
    private BigDecimal dealPrice;      // 공동구매 가격
    private BigDecimal discountRate;   // 할인율 (예: 63.00)

    private Integer minMemberCount;    // 성공 최소 인원
    private Integer maxMemberCount;    // 최대 인원 (nullable)
    private Integer perUserLimitQty;   // 1인당 수량 제한 (nullable)

    private LocalDateTime startAt;     // 시작 일시
    private LocalDateTime endAt;       // 종료 일시(카운트다운 기준)

    private String status;             // SCHEDULED/OPEN/SUCCESS/FAIL
    private String isActive;           // Y/N

    private String createdBy;          // 관리자 userId
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
