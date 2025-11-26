// com.farmday.producer.dto.TopProductDto
package com.farmday.producer.dto;

import lombok.Data;

@Data
public class TopProductDto {

    private Long productId;
    private String productName;

    private Long totalQuantity; // SUM(quantity)
    private Long totalAmount;   // SUM(line_total_amount)
}