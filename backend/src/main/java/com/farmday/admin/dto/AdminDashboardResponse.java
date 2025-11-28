// src/main/java/com/farmday/admin/dto/AdminDashboardResponse.java
package com.farmday.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminDashboardResponse {

    private UserSummary userSummary;
    private RealtimeStats realtimeStats;
    private ProducerRanking producerRanking;
    private OrderStats orderStats;

    // 1) 회원 요약
    @Data
    public static class UserSummary {
        private long totalUsers;
        private long totalProducers;
        private long pendingProducers;
    }

    // 2) 실시간 통계
    @Data
    public static class RealtimeStats {
        // 최근 등록 상품 TOP 5 (프론트에서는 여전히 topViewedProducts 이름 사용)
        private List<ProductRecent> topViewedProducts;

        // 거래량 TOP 5
        private List<ProductTrade> topTradedProducts;

        // 최근 주문 상품 TOP 5
        private List<ProductTrade> recentOrderedProducts;
    }

    // 최근 등록 상품
    @Data
    public static class ProductRecent {
        private Long productId;
        private String productName;
        private String producerName;
        private String createdDate;   // 또는 LocalDateTime
    }

    // 거래/주문 통계용 상품 정보
    @Data
    public static class ProductTrade {
        private Long productId;
        private String productName;
        private String producerName;
        private Long orderCount;
        private Long totalAmount;
        private String lastOrderDate; // 최근 주문일 (recentOrderedProducts에서만 채워져도 됨)
    }

    // 3) 생산자 랭킹
    @Data
    public static class ProducerRanking {
        private List<ProducerRank> daily;
        private List<ProducerRank> monthly;
    }

    @Data
    public static class ProducerRank {
        private Long producerId;
        private String producerName;
        private Long orderCount;
        private Long totalAmount;
    }

    // 4) 주문 통계
    @Data
    public static class OrderStats {
        private long todayOrderCount;
        private List<OrderPoint> daily;
        private List<OrderPoint> monthly;
    }

    @Data
    public static class OrderPoint {
        private String dateLabel; // "MM-dd" or "yyyy-MM"
        private long orderCount;
    }
}