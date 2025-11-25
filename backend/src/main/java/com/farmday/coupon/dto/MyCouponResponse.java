package com.farmday.coupon.dto;

import lombok.Data;

@Data
public class MyCouponResponse {
    private Long couponId;
    private String couponName;
    private String discountType;     // RATE or AMOUNT
    private Double discountValue;
    private Long minOrderAmount;
    private String expiresAt;        // yyyy-MM-dd HH:mm
    private boolean used;
}
