// src/main/java/com/farmday/admin/mapper/AdminDashboardMapper.java
package com.farmday.admin.mapper;

import com.farmday.admin.dto.AdminDashboardResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminDashboardMapper {

    // 1) 회원 요약
    long countConsumers();              // 전체 소비자 수
    long countApprovedProducers();      // 승인된 생산자 수
    long countPendingProducers();       // 승인 대기 생산자 수

    // 2) 실시간 통계
    // 2-1) 최근 등록 상품 TOP 5 (기존 topViewedProducts 자리에 재사용)
    List<AdminDashboardResponse.ProductRecent> selectTopViewedProducts(
            @Param("limit") int limit
    );

    // 2-2) 거래량 TOP 5 (기존 그대로 사용)
    List<AdminDashboardResponse.ProductTrade> selectTopTradedProducts(
            @Param("limit") int limit
    );

    // 2-3) 최근 주문 상품 TOP 5 (새로 추가)
    List<AdminDashboardResponse.ProductTrade> selectRecentOrderedProducts(
            @Param("limit") int limit
    );

    // 3) 생산자 랭킹
    List<AdminDashboardResponse.ProducerRank> selectProducerRankingDaily(
            @Param("limit") int limit
    );
    List<AdminDashboardResponse.ProducerRank> selectProducerRankingMonthly(
            @Param("limit") int limit
    );

    // 4) 주문 통계
    long countTodayOrders();
    List<AdminDashboardResponse.OrderPoint> selectDailyOrderStats(
            @Param("days") int days
    );
    List<AdminDashboardResponse.OrderPoint> selectMonthlyOrderStats(
            @Param("months") int months
    );
}