// com.farmday.producer.dto.DailySalesDto
package com.farmday.producer.dto;

import java.util.Date;

import lombok.Data;

@Data
public class DailySalesDto {
    private Date salesDate;   // TRUNC(order_date)
    private Long totalAmount; // SUM(line_total_amount)
    private Long orderCount;  // COUNT(DISTINCT order_id)
}