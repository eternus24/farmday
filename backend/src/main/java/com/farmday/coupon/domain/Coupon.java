package com.farmday.coupon.domain;

import java.time.LocalDateTime;

import lombok.Data;

// Coupon
@Data
public class Coupon {
    private Long couponId;
    private Long userNo;
    private String couponTypeCode;
    private String couponName;
    private String discountType;
    private Double discountValue;
    private Long minOrderAmount;
    private Long maxDiscountAmount;
    private String firstOrderOnly; // 'Y'/'N'
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private String gradeCodeIssuedFrom;
}