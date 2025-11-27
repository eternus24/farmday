// com.farmday.producer.dto.ProducerOrderItemDto
package com.farmday.producer.dto;

import java.util.Date;

import lombok.Data;

@Data
public class ProducerOrderItemDto {

    private Long orderItemId;
    private Long orderId;
    private Date orderDate;

    private String orderStatus;
    private String deliveryStatus;

    // 구매자 정보 대신 수령인 정보 사용 (ORDERS 테이블 기준)
    private String receiverName;
    private String receiverPhone;
    private String receiverAddr;

    private String carrierName;
    private String trackingNumber;

    private Long productId;
    private String productName;   // ORDERS_ITEM.product_name 사용

    private Integer quantity;
    private Long priceAtOrder;    // ORDERS_ITEM.price_at_order
    private Long lineTotalAmount; // ORDERS_ITEM.line_total_amount
}