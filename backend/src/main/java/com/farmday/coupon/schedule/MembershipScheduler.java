package com.farmday.coupon.schedule;

import com.farmday.coupon.service.MembershipCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MembershipScheduler {

    private final MembershipCouponService membershipCouponService;

    // 매일 새벽 3시: 생일 쿠폰 발급
    @Scheduled(cron = "0 0 3 * * ?")
    public void runBirthdayCouponJob() {
        membershipCouponService.issueBirthdayCouponsForToday();
    }

    // 매달 1일 새벽 4시: 등급별 월간 쿠폰 발급
    @Scheduled(cron = "0 0 4 1 * ?")
    public void runMonthlyGradeCouponJob() {
        membershipCouponService.issueMonthlyGradeCoupons();
    }
}
