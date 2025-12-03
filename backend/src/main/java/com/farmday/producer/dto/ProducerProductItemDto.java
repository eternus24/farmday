package com.farmday.producer.dto;

import java.util.Date;

import lombok.Data;

@Data
public class ProducerProductItemDto {

    private Long productId;
    private Long detailId;

    private String productName;   // PRODUCT.name
    private Long baseCategoryId;  // ★ 추가

    private String grade;         // ★ 등급 (PRODUCT_DETAIL.grade)

    private String unitName;      // PRODUCT_DETAIL.unit_name
    private Integer price;        // PRODUCT_DETAIL.price
    private Integer stockQty;     // PRODUCT_DETAIL.stock_qty

    private String status;        // PRODUCT.status
    private Date updatedDate;     // PRODUCT_DETAIL.updated_date
}