// src/main/java/com/farmday/delivery/service/DeliveryServiceImpl.java
package com.farmday.delivery.service;

import com.farmday.delivery.domain.Delivery;
import com.farmday.delivery.dto.UserDeliveryTrackingDto;
import com.farmday.delivery.dto.ProducerDeliveryUpdateRequest;
import com.farmday.delivery.mapper.DeliveryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryMapper deliveryMapper;
    // private final OrderMapper orderMapper;  // 나중에 주문 소유자/생산자 검증할 때 사용 가능
    // private final NotificationService notificationService; // 나중에 알림 기능 연동용

    @Override
    public UserDeliveryTrackingDto getUserDeliveryTracking(Long orderId, String currentUserId) {

        // TODO: 여기서 orderId가 정말 currentUserId의 주문인지 체크하는 로직(보안) 넣으면 좋음
        // ex) Orders order = orderMapper.findById(orderId); ...

        Delivery delivery = deliveryMapper.findByOrderId(orderId);
        if (delivery == null) {
            return null; // 아직 배송 정보 없는 상태
        }

        UserDeliveryTrackingDto dto = new UserDeliveryTrackingDto();
        dto.setOrderId(orderId);
        dto.setCarrierName(delivery.getCarrierName());
        dto.setTrackingNumber(delivery.getTrackingNumber());
        dto.setDeliveryStatus(delivery.getDeliveryStatus());
        dto.setShippedAt(delivery.getShippedAt());
        dto.setExpectedDeliveryAt(delivery.getExpectedDeliveryAt());
        dto.setDeliveredAt(delivery.getDeliveredAt());
        dto.setTrackingUrl(buildTrackingUrl(delivery.getCarrierName(), delivery.getTrackingNumber()));

        return dto;
    }

    @Override
    @Transactional
    public void updateDeliveryByProducer(ProducerDeliveryUpdateRequest request, Long producerId) {

        // TODO: 이 주문이 이 생산자의 주문인지 검증 (보안)
        // ex) if (!orderMapper.isOrderOwnedByProducer(request.getOrderId(), producerId)) { ... }

        Delivery delivery = deliveryMapper.findByOrderId(request.getOrderId());
        boolean isNew = false;

        if (delivery == null) {
            delivery = new Delivery();
            isNew = true;
            delivery.setOrderId(request.getOrderId());
            delivery.setCreatedDate(LocalDateTime.now());
            // delivery_id는 트리거로 자동 생성
        }

        delivery.setCarrierName(request.getCarrierName());
        delivery.setTrackingNumber(request.getTrackingNumber());
        delivery.setDeliveryStatus(request.getDeliveryStatus());
        delivery.setExpectedDeliveryAt(request.getExpectedDeliveryAt());
        delivery.setUpdatedDate(LocalDateTime.now());

        // 상태에 따라 시간 자동 세팅
        if ("SHIPPED".equalsIgnoreCase(request.getDeliveryStatus())
                && delivery.getShippedAt() == null) {
            delivery.setShippedAt(LocalDateTime.now());
        }
        if ("DELIVERED".equalsIgnoreCase(request.getDeliveryStatus())) {
            delivery.setDeliveredAt(LocalDateTime.now());
        }

        if (isNew) {
            deliveryMapper.insertDelivery(delivery);
        } else {
            deliveryMapper.updateDelivery(delivery);
        }

        // 나중에 알림 기능 넣으려면 여기에서 호출하면 됨
        // notificationService.sendDeliveryStatusChanged(request.getOrderId(), delivery.getDeliveryStatus());
    }

    // 택배사별 조회 URL (선택 기능)
    private String buildTrackingUrl(String carrierName, String trackingNumber) {
        if (carrierName == null || trackingNumber == null) return null;

        String carrier = carrierName.toUpperCase();

        if (carrier.contains("CJ")) {
            // 예시 URL (실제 서비스 주소는 나중에 정확히 수정)
            return "https://trace.cjlogistics.com/web/detail.jsp?slipno=" + trackingNumber;
        }
        if (carrier.contains("LOGEN") || carrier.contains("로젠")) {
            return "https://www.ilogen.com/web/personal/trace/" + trackingNumber;
        }
        // 기타 택배사들 나중에 추가
        return null;
    }
}