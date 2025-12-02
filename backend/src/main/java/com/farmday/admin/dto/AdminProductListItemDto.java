// src/main/java/com/farmday/admin/product/dto/AdminProductListItemDto.java
package com.farmday.admin.dto;

import lombok.Data;

@Data
public class AdminProductListItemDto {

    private Long productId;
    private String name;

    private Long producerId;
    private String producerName;

    private Long baseCategoryId;
    private String baseCategoryName;

    private String mainImage;

    private String status;          // PRODUCT.status
    private Long recentSalesQty;    // 최근 30일 판매 수량
    private String createdDate;     // YYYY-MM-DD HH24:MI
}