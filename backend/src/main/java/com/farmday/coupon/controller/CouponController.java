package com.farmday.coupon.controller;

import com.farmday.coupon.domain.Coupon;
import com.farmday.coupon.dto.MyCouponResponse;
import com.farmday.coupon.service.MembershipCouponService;
import com.farmday.orders.OrdersService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    private final OrdersService ordersService;

    @PostMapping("/addWinterEventCoupon")
    public ResponseEntity<String> addWinterEventCoupon(
        @RequestParam("user_id") String userId
    ) throws Exception {
        System.out.println(">>> addWinterEventCoupon entered");
        if (userId.equals("") || userId==null) {
            return ResponseEntity.badRequest().body("need_login");
        }

        Long userNo = (Long)(ordersService.findUserInfoForOrder(userId).getUser_no());
        boolean isAlreadyHaving = 
            membershipCouponService.existsWinterEventCoupon(userNo)>0 ? true : false;
        if (isAlreadyHaving) {
            return ResponseEntity.badRequest().body("already_having_same_coupon");
        }

        Coupon coupon = new Coupon();

        coupon.setUserNo(userNo);
        coupon.setCouponTypeCode("WINTER_EVENT");
        coupon.setCouponName("겨울 이벤트 쿠폰");
        coupon.setDiscountType("RATE");
        coupon.setDiscountValue((double)10);
        coupon.setMinOrderAmount((long)0);
        coupon.setMaxDiscountAmount(null);
        coupon.setFirstOrderOnly("N");
        coupon.setExpiresAt(LocalDateTime.parse("2025-12-31T23:59:59"));

        membershipCouponService.insertCoupon(coupon);

        return ResponseEntity.ok("쿠폰을 등록하였습니다.");
    }

}