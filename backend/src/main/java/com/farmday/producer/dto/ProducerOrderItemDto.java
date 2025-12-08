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

    // 수령인 정보
    private String receiverName;
    private String receiverPhone;
    private String receiverAddr;

    // 배송 정보
    private String carrierName;
    private String trackingNumber;

    // 상품
    private Long productId;
    private String productName;

    private Integer quantity;
    private Long priceAtOrder;
    private Long lineTotalAmount;

    // =============================
    // 🔥 그룹딜 필드 추가
    // =============================
    private Long groupDealId;          // 주문 항목이 공구라면 값 존재
    private String groupDealTitle;     // 공동구매 제목
    private Long groupDealPrice;       // 공구 가격 (표시용)
    private Date shippingStartDate;    // 배송 시작 예정일
    private Date shippingEndDate;      // 배송 종료 예정일
}