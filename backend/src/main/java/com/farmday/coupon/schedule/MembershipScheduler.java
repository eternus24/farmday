package com.farmday.coupon.schedule;

import com.farmday.coupon.service.MembershipCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MembershipScheduler {

    private final MembershipCouponService membershipCouponService;

    // 매일 오전 4시: 생일 쿠폰 발급
    // @Scheduled(cron = "0 0 04 * * ?")
    @Scheduled(cron = "0 0/30 * * * ?")
    public void runBirthdayCouponJob() {
        System.out.println(">>> [Scheduler] Birthday job started");
        membershipCouponService.issueBirthdayCouponsForToday();
    }

    // 매달 1일 오전 10시: 등급별 월간 쿠폰 발급
    @Scheduled(cron = "0 0 10 1 * ?")
    public void runMonthlyGradeCouponJob() {
        membershipCouponService.issueMonthlyGradeCoupons();
    }
}