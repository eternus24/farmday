// src/main/java/com/farmday/admin/service/AdminDashboardServiceImpl.java
package com.farmday.admin.service;

import com.farmday.admin.dto.AdminDashboardResponse;
import com.farmday.admin.mapper.AdminDashboardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final AdminDashboardMapper adminDashboardMapper;

    @Override
    public AdminDashboardResponse getDashboard() {

        AdminDashboardResponse dto = new AdminDashboardResponse();

        // ───────── 1) 회원 요약 ─────────
        AdminDashboardResponse.UserSummary us = new AdminDashboardResponse.UserSummary();
        us.setTotalUsers(adminDashboardMapper.countConsumers());
        us.setTotalProducers(adminDashboardMapper.countApprovedProducers());
        us.setPendingProducers(adminDashboardMapper.countPendingProducers());
        dto.setUserSummary(us);

        // ───────── 2) 실시간 통계 ─────────
        AdminDashboardResponse.RealtimeStats rt = new AdminDashboardResponse.RealtimeStats();
        // 최근 등록 상품 TOP5 (기존 topViewedProducts 필드 재활용)
        rt.setTopViewedProducts(adminDashboardMapper.selectTopViewedProducts(5));
        // 거래량 TOP5 (기존 유지)
        rt.setTopTradedProducts(adminDashboardMapper.selectTopTradedProducts(5));
        // 최근 주문 상품 TOP5 (새로 추가)
        rt.setRecentOrderedProducts(adminDashboardMapper.selectRecentOrderedProducts(5));
        dto.setRealtimeStats(rt);

        // ───────── 3) 생산자 랭킹 ─────────
        AdminDashboardResponse.ProducerRanking pr = new AdminDashboardResponse.ProducerRanking();
        pr.setDaily(adminDashboardMapper.selectProducerRankingDaily(5));
        pr.setMonthly(adminDashboardMapper.selectProducerRankingMonthly(5));
        dto.setProducerRanking(pr);

        // ───────── 4) 주문 통계 ─────────
        AdminDashboardResponse.OrderStats os = new AdminDashboardResponse.OrderStats();
        os.setTodayOrderCount(adminDashboardMapper.countTodayOrders());
        os.setDaily(adminDashboardMapper.selectDailyOrderStats(7));    // 최근 7일
        os.setMonthly(adminDashboardMapper.selectMonthlyOrderStats(6)); // 최근 6개월
        dto.setOrderStats(os);

        return dto;
    }
}