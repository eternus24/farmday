package com.farmday.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AdminDashboardResponse {

    private UserSummary userSummary;
    private RealtimeStats realtimeStats;
    private ProducerRanking producerRanking;
    private OrderStats orderStats;

    @Data
    public static class UserSummary {
        private long totalUsers;
        private long totalProducers;
        private long pendingProducers;
        private long todayOrderCount;
    }

    @Data
    public static class RealtimeStats {
        private List<ProductStat> topViewedProducts = new ArrayList<>();
        private List<ProductStat> topTradedProducts = new ArrayList<>();
    }

    @Data
    public static class ProductStat {
        private Long productId;
        private String productName;
        private String producerName;
        private long viewCount;   // 조회수
        private long orderCount;  // 거래량
    }

    @Data
    public static class ProducerRanking {
        private List<ProducerRank> daily = new ArrayList<>();
        private List<ProducerRank> monthly = new ArrayList<>();
    }

    @Data
    public static class ProducerRank {
        private Long producerId;
        private String producerName;
        private long orderCount;
        private long totalAmount;
    }

    @Data
    public static class OrderStats {
        private long todayOrderCount;
        private List<OrderPoint> daily = new ArrayList<>();
        private List<OrderPoint> monthly = new ArrayList<>();
    }

    @Data
    public static class OrderPoint {
        private String dateLabel;   // "11-20" 또는 "2025-11"
        private long orderCount;
        private long totalAmount;
    }

    // 🔹 테스트용 더미 데이터 생성 메서드
    public static AdminDashboardResponse mock() {
        AdminDashboardResponse dto = new AdminDashboardResponse();

        // 1) 회원 요약
        UserSummary us = new UserSummary();
        us.setTotalUsers(1234);
        us.setTotalProducers(45);
        us.setPendingProducers(3);
        us.setTodayOrderCount(27);
        dto.setUserSummary(us);

        // 2) 실시간 통계
        RealtimeStats rt = new RealtimeStats();
        ProductStat p1 = new ProductStat();
        p1.setProductId(1L);
        p1.setProductName("햇감자 5kg");
        p1.setProducerName("감자농장");
        p1.setViewCount(321);
        rt.getTopViewedProducts().add(p1);

        ProductStat p2 = new ProductStat();
        p2.setProductId(2L);
        p2.setProductName("유기농 상추");
        p2.setProducerName("상추팜");
        p2.setOrderCount(42);
        rt.getTopTradedProducts().add(p2);
        dto.setRealtimeStats(rt);

        // 3) 생산자 랭킹
        ProducerRanking pr = new ProducerRanking();
        ProducerRank r1 = new ProducerRank();
        r1.setProducerId(10L);
        r1.setProducerName("감자농장");
        r1.setOrderCount(15);
        r1.setTotalAmount(230000);
        pr.getDaily().add(r1);

        ProducerRank r2 = new ProducerRank();
        r2.setProducerId(20L);
        r2.setProducerName("상추팜");
        r2.setOrderCount(120);
        r2.setTotalAmount(3200000);
        pr.getMonthly().add(r2);
        dto.setProducerRanking(pr);

        // 4) 주문 통계
        OrderStats os = new OrderStats();
        os.setTodayOrderCount(27);

        OrderPoint d1 = new OrderPoint();
        d1.setDateLabel("11-19");
        d1.setOrderCount(20);
        d1.setTotalAmount(150000);
        os.getDaily().add(d1);

        OrderPoint d2 = new OrderPoint();
        d2.setDateLabel("11-20");
        d2.setOrderCount(35);
        d2.setTotalAmount(280000);
        os.getDaily().add(d2);

        OrderPoint m1 = new OrderPoint();
        m1.setDateLabel("2025-10");
        m1.setOrderCount(300);
        m1.setTotalAmount(4500000);
        os.getMonthly().add(m1);

        dto.setOrderStats(os);

        return dto;
    }
}