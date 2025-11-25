// src/main/java/com/farmday/delivery/dto/UserDeliveryTrackingDto.java
package com.farmday.delivery.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDeliveryTrackingDto {

    private Long orderId;

    // 배송 정보
    private String carrierName;          // 택배사명
    private String trackingNumber;       // 송장번호
    private String deliveryStatus;       // 배송 상태
    private LocalDateTime shippedAt;     // 출고 일시
    private LocalDateTime expectedDeliveryAt; // 예상 도착일
    private LocalDateTime deliveredAt;   // 배송 완료 일시

    // 표시용
    private String trackingUrl;          // 택배 조회 URL (선택)
}