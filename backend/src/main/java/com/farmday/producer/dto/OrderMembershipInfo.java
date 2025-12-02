package com.farmday.producer.dto;

import lombok.Data;

@Data
public class OrderMembershipInfo {
    private Long orderId;
    private Long userNo;
    private Long payAmount;  // 결제 총액

}