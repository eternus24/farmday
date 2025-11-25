// src/main/java/com/farmday/delivery/domain/Delivery.java
package com.farmday.delivery.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Delivery {

    private Long deliveryId;
    private Long orderId;
    private String carrierName;
    private String trackingNumber;
    private String deliveryStatus;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime expectedDeliveryAt;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}