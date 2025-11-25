package com.farmday.coupon.service;

import java.util.List;

import com.farmday.coupon.dto.MyCouponResponse;

public interface MembershipCouponService {

    // 회원가입 직후 호출: 웰컴 쿠폰 발급
    void issueWelcomeCouponOnSignup(Long userNo);

    // 스케줄러에서 호출: 오늘 생일인 유저에게 쿠폰 발급
    void issueBirthdayCouponsForToday();

    // 스케줄러에서 호출: 매달 1일 등급별 쿠폰 발급
    void issueMonthlyGradeCoupons();

    List<MyCouponResponse> getMyCoupons(Long userNo);
    
}