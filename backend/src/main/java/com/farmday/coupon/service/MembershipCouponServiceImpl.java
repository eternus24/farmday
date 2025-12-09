package com.farmday.coupon.service;

import com.farmday.coupon.domain.Coupon;
import com.farmday.coupon.domain.CouponTemplate;
import com.farmday.coupon.dto.MyCouponResponse;
import com.farmday.coupon.mapper.CouponMapper;
import com.farmday.user.domain.User;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MembershipCouponServiceImpl implements MembershipCouponService {

    private final CouponMapper couponMapper;

    // 등급별 월 쿠폰 할인율 매핑 (3,5,7,10)
    private double getMonthlyDiscountByGrade(String gradeCode) {

        switch (gradeCode) {
            case "SEASAK":
                return 3.0;
            case "DANGOL":
                return 5.0;
            case "DANGOL_VIP":
                return 7.0;
            case "DANGOL_FAMILY":
                return 10.0;
            default:
                return 0.0;
        }
    }

    @Override
    @Transactional
    public void issueWelcomeCouponOnSignup(Long userNo) {
        if (couponMapper.existsWelcomeCoupon(userNo) > 0) {
            return; // 이미 있으면 발급 X (중복가입 방지용)
        }

        CouponTemplate tpl = couponMapper.findTemplateByCode("WELCOME");
        if (tpl == null) return;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusDays(tpl.getValidDays() != null ? tpl.getValidDays() : 30)
                                     .truncatedTo(ChronoUnit.SECONDS);

        Coupon coupon = new Coupon();
        coupon.setUserNo(userNo);
        coupon.setCouponTypeCode("WELCOME");
        coupon.setCouponName(tpl.getCouponName());
        coupon.setDiscountType(tpl.getDefaultDiscountType());
        coupon.setDiscountValue(tpl.getDefaultDiscountValue());
        coupon.setMinOrderAmount(tpl.getDefaultMinOrderAmount());
        coupon.setMaxDiscountAmount(null);
        coupon.setFirstOrderOnly("Y");
        coupon.setIssuedAt(now);
        coupon.setExpiresAt(expiresAt);
        coupon.setGradeCodeIssuedFrom(null);

        couponMapper.insertCoupon(coupon);
    }

    @Override
    @Transactional
    public void issueBirthdayCouponsForToday() {
        CouponTemplate tpl = couponMapper.findTemplateByCode("BDAY");
        if (tpl == null) return;

        List<User> users = couponMapper.findUsersHavingBirthdayToday();
        LocalDateTime now = LocalDateTime.now();

        for (User user : users) {
            Long userNo = user.getUserNo();
            if (couponMapper.existsBirthdayCouponThisYear(userNo) > 0) {
                continue;
            }

            LocalDateTime expiresAt = now.plusDays(
                    tpl.getValidDays() != null ? tpl.getValidDays() : 7
            ).truncatedTo(ChronoUnit.SECONDS);

            Coupon coupon = new Coupon();
            coupon.setUserNo(userNo);
            coupon.setCouponTypeCode("BDAY");
            coupon.setCouponName(tpl.getCouponName());
            coupon.setDiscountType(tpl.getDefaultDiscountType());
            coupon.setDiscountValue(tpl.getDefaultDiscountValue());
            coupon.setMinOrderAmount(tpl.getDefaultMinOrderAmount());
            coupon.setFirstOrderOnly("N");
            coupon.setIssuedAt(now);
            coupon.setExpiresAt(expiresAt);

            couponMapper.insertCoupon(coupon);
        }
    }

    @Override
    @Transactional
    public void issueMonthlyGradeCoupons() {
        CouponTemplate tpl = couponMapper.findTemplateByCode("MONTHLY_GRADE");
        if (tpl == null) return;

        List<Map<String, Object>> rows = couponMapper.findUserMembershipsForMonthlyCoupon();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusDays(
                tpl.getValidDays() != null ? tpl.getValidDays() : 30
        ).truncatedTo(ChronoUnit.SECONDS);

        for (Map<String, Object> row : rows) {
            Long userNo = ((Number) row.get("userNo")).longValue();
            String gradeCode = (String) row.get("gradeCode");

            // 이미 이번 달 쿠폰 있으면 패스
            if (couponMapper.existsMonthlyGradeCouponThisMonth(userNo) > 0) {
                continue;
            }

            double discount = getMonthlyDiscountByGrade(gradeCode);
            if (discount <= 0.0) continue;

            Coupon coupon = new Coupon();
            coupon.setUserNo(userNo);
            coupon.setCouponTypeCode("MONTHLY_GRADE");
            coupon.setCouponName(tpl.getCouponName());
            coupon.setDiscountType("RATE"); // 고정
            coupon.setDiscountValue(discount); // ★ 등급별 3/5/7/10
            coupon.setMinOrderAmount(tpl.getDefaultMinOrderAmount());
            coupon.setFirstOrderOnly("N");
            coupon.setIssuedAt(now);
            coupon.setExpiresAt(expiresAt);
            coupon.setGradeCodeIssuedFrom(gradeCode);

            couponMapper.insertCoupon(coupon);
        }
        
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyCouponResponse> getMyCoupons(Long userNo) {
        return couponMapper.findCouponsByUserNo(userNo);
    }

    //=========================yh===============================
    @Override
    public void insertCoupon(Coupon coupon) {
        couponMapper.insertCoupon(coupon);
    }

    @Override
    public int existsWinterEventCoupon(Long userNo) {
        return couponMapper.existsWinterEventCoupon(userNo);
    }

    @Override
    public int deleteUsedCoupon(int user_no, int coupon_id) {
        return couponMapper.deleteUsedCoupon(user_no,coupon_id);
    }
    
}