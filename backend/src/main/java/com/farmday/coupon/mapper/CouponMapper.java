package com.farmday.coupon.mapper;

import com.farmday.coupon.domain.Coupon;
import com.farmday.coupon.domain.CouponTemplate;
import com.farmday.coupon.dto.MyCouponResponse;
import com.farmday.user.domain.User;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface CouponMapper {

    CouponTemplate findTemplateByCode(String couponTypeCode);

    int existsWelcomeCoupon(Long userNo);
    int existsBirthdayCouponThisYear(Long userNo);
    int existsMonthlyGradeCouponThisMonth(Long userNo);

    List<User> findUsersHavingBirthdayToday();

    List<Map<String, Object>> findUserMembershipsForMonthlyCoupon();

    void insertCoupon(Coupon coupon);

    List<MyCouponResponse> findCouponsByUserNo(Long userNo);

}