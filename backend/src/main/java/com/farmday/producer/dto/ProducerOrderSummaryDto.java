package com.farmday.producer.dto;

import java.util.Date;
import lombok.Data;

@Data
public class ProducerOrderSummaryDto {

    private Long orderId;          // ORDERS.order_id
    private String orderNo;        // 화면용 주문번호 (그냥 orderId 문자열로 써도 됨)
    private Date orderDate;        // ORDERS.order_date
    private String orderStatus;    // ORDERS.order_status

    private String buyerName;      // 수령인 기준 -> ORDERS.receiver_name
    private String buyerPhone;     // ORDERS.receiver_phone
    private String buyerAddr;      // ORDERS.receiver_addr

    private String firstProductName;  // 첫 번째 상품명
    private int itemCount;           // 주문에 포함된 상품 개수
    private Long totalAmount;        // 주문 총 금액 (상품금액 합 + 필요시 배송비 등)

    private String status;           // 주문 상태 (ORDERED, PAID, DELIVERED...)
}