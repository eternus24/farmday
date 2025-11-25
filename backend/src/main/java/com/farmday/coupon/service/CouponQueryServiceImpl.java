package com.farmday.coupon.service;

import com.farmday.coupon.dto.MyCouponResponse;
import com.farmday.coupon.mapper.CouponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponQueryServiceImpl implements CouponQueryService {

    private final CouponMapper couponMapper;

    @Override
    public List<MyCouponResponse> getMyCoupons(Long userNo) {
        return couponMapper.findCouponsByUserNo(userNo);
    }
}