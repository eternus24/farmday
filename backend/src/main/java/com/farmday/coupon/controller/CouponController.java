package com.farmday.coupon.controller;

import com.farmday.coupon.dto.MyCouponResponse;
import com.farmday.coupon.service.MembershipCouponService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage/coupon")
public class CouponController {

    private final MembershipCouponService membershipCouponService;

    @GetMapping("/my-coupons")
    public ResponseEntity<List<MyCouponResponse>> getMyCoupons(
            @RequestParam("userNo") Long userNo
    ) {
        List<MyCouponResponse> coupons = membershipCouponService.getMyCoupons(userNo);
        return ResponseEntity.ok(coupons);
    }

}