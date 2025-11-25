package com.farmday.coupon.domain;

import lombok.Data;

@Data
public class CouponTemplate {
    private String couponTypeCode;
    private String couponName;
    private String defaultDiscountType;
    private Double defaultDiscountValue;
    private Long defaultMinOrderAmount;
    private Integer validDays;
    private String description;
    private String isActive;
}