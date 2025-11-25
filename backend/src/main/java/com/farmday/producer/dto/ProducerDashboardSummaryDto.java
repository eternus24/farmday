// com.farmday.producer.dto.ProducerDashboardSummaryDto
package com.farmday.producer.dto;

import lombok.Data;

@Data
public class ProducerDashboardSummaryDto {
    private Long producerId;
    private Long todaySalesAmount;   // 오늘 매출
    private Long monthSalesAmount;   // 이번 달 매출
    private Integer newOrderCount;   // 신규 주문 수
}