// src/main/java/com/farmday/admin/service/AdminDashboardServiceImpl.java
package com.farmday.admin.service;

import com.farmday.admin.dto.AdminDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    // private final UserMapper userMapper;
    // private final OrderMapper orderMapper;
    // private final ProducerMapper producerMapper;
    // private final ProductMapper productMapper;

    @Override
    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse dto = new AdminDashboardResponse();

        // 1) 회원 요약
        AdminDashboardResponse.UserSummary us = new AdminDashboardResponse.UserSummary();
        // us.setTotalUsers(userMapper.countByRole("USER"));
        // us.setTotalProducers(producerMapper.countApproved());
        // us.setPendingProducers(producerMapper.countPending());
        // us.setTodayOrderCount(orderMapper.countToday());
        dto.setUserSummary(us);

        // 2) 실시간 통계 (조회수/거래량 TOP5)
        AdminDashboardResponse.RealtimeStats rt = new AdminDashboardResponse.RealtimeStats();
        // rt.setTopViewedProducts(productMapper.findTopViewedProducts(5));
        // rt.setTopTradedProducts(orderMapper.findTopTradedProducts(5));
        dto.setRealtimeStats(rt);

        // 3) 생산자 랭킹
        AdminDashboardResponse.ProducerRanking pr = new AdminDashboardResponse.ProducerRanking();
        // pr.setDaily(orderMapper.findProducerRankingDaily(5));
        // pr.setMonthly(orderMapper.findProducerRankingMonthly(5));
        dto.setProducerRanking(pr);

        // 4) 주문 통계
        AdminDashboardResponse.OrderStats os = new AdminDashboardResponse.OrderStats();
        // os.setTodayOrderCount(orderMapper.countToday());
        // os.setDaily(orderMapper.findDailyOrderStats(7));
        // os.setMonthly(orderMapper.findMonthlyOrderStats(6));
        dto.setOrderStats(os);

        return dto;
    }
}