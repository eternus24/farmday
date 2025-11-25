// com.farmday.producer.dto.LowStockProductDto
package com.farmday.producer.dto;

import lombok.Data;

@Data
public class LowStockProductDto {
    private Long productId;
    private String productName;
    private Integer stockQty;
    private Integer safetyStockQty;
}