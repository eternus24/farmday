// backend/src/main/java/com/farmday/membership/dto/MembershipStatusResponse.java
package com.farmday.membership.dto;

import lombok.Data;

@Data
public class MembershipStatusResponse {

    private Long userNo;

    private String gradeCode;          // SEASAK / DANGOL / DANGOL_VIP / DANGOL_FAMILY
    private String gradeName;          // 새싹단골 / 단골 / 단골VIP / 단골패밀리

    private Long monthSpentAmount;      // 최근 1년 결제 금액(우선 USER_MEMBERSHIP 값)
    private Long lifetimeSpentAmount;  // 전체 누적 금액

    private Double discountRate;       // MEMBERSHIP_GRADE.discount_rate
    private Double pointRate;          // MEMBERSHIP_GRADE.point_rate
    private Integer freeShippingCnt;   // MEMBERSHIP_GRADE.free_shipping_cnt

    // 나중에 추가해도 되는 필드들
    private String nextGradeCode;
    private String nextGradeName;
    private Long nextGradeNeedAmount;
}
