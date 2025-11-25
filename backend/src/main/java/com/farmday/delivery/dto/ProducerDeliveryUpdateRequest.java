// src/main/java/com/farmday/delivery/dto/ProducerDeliveryUpdateRequest.java
package com.farmday.delivery.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProducerDeliveryUpdateRequest {

    private Long orderId;                 // 어떤 주문인지
    private String carrierName;           // 택배사명
    private String trackingNumber;        // 송장번호
    private String deliveryStatus;        // READY / SHIPPED / IN_TRANSIT / DELIVERED ...
    private LocalDateTime expectedDeliveryAt; // 예상 도착일 (선택)
}