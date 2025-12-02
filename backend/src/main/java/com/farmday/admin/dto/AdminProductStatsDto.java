// src/main/java/com/farmday/admin/product/dto/AdminProductStatsDto.java
package com.farmday.admin.dto;

import lombok.Data;

@Data
public class AdminProductStatsDto {

    private Long productId;
    private String name;

    private Long producerId;
    private String producerName;

    private Long salesQty;      // 합계 판매 수량
    private Long salesAmount;   // 합계 매출액
}
