// src/main/java/com/farmday/delivery/service/DeliveryService.java
package com.farmday.delivery.service;

import com.farmday.delivery.dto.UserDeliveryTrackingDto;
import com.farmday.delivery.dto.ProducerDeliveryUpdateRequest;

public interface DeliveryService {

    // 소비자: 주문별 배송 조회
    UserDeliveryTrackingDto getUserDeliveryTracking(Long orderId, String currentUserId);

    // 생산자: 송장/상태 등록/수정
    void updateDeliveryByProducer(ProducerDeliveryUpdateRequest request, Long producerId);
}