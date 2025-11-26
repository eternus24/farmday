// com.farmday.producer.dto.SalesItemDto
package com.farmday.producer.dto;

import java.util.Date;

import lombok.Data;

@Data
public class SalesItemDto {

    private Long orderItemId;
    private Long orderId;
    private Date orderDate;

    private String orderStatus;
    private String deliveryStatus;

    private String receiverName;
    private String receiverPhone;

    private Long productId;
    private String productName;

    private Integer quantity;
    private Long priceAtOrder;
    private Long lineTotalAmount;
}