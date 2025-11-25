package com.farmday.membership.domain;

import lombok.Data;

@Data
public class MembershipGrade {

    private String gradeCode;        // PK
    private String gradeName;

    private Long minAmount;          // 등급 최소금액
    private Long maxAmount;          // 등급 상한금액 (NULL=최고등급)

    private Double discountRate;     // 3.0 / 5.0 / 7.0 / 10.0
    private Double pointRate;        // 선택 기능
    private Integer freeShippingCnt; // 월 무료배송 횟수

    private String birthdayCouponYn;
    private String isActive;

    private Integer sortOrder;

    private java.util.Date createdDate;
    private java.util.Date updatedDate;
}