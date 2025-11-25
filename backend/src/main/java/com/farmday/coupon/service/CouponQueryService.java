package com.farmday.coupon.service;

import com.farmday.coupon.dto.MyCouponResponse;
import java.util.List;

public interface CouponQueryService {
    List<MyCouponResponse> getMyCoupons(Long userNo);
}