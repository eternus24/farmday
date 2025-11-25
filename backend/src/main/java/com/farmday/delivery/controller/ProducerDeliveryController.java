// src/main/java/com/farmday/delivery/controller/ProducerDeliveryController.java
package com.farmday.delivery.controller;

import com.farmday.delivery.dto.ProducerDeliveryUpdateRequest;
import com.farmday.delivery.dto.UserDeliveryTrackingDto;
import com.farmday.delivery.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/producer/orders")
public class ProducerDeliveryController {

    private final DeliveryService deliveryService;

    /**
     * 생산자: 주문 배송 정보 조회 (자기 주문 확인용)
     * GET /api/producer/orders/{orderId}/delivery
     */
    @GetMapping("/{orderId}/delivery")
    public ResponseEntity<UserDeliveryTrackingDto> getProducerDelivery(
            @PathVariable Long orderId
            /*, @AuthenticationPrincipal ProducerUser producer */
    ) {
        // 생산자도 화면에 보여줄 내용은 같으니 UserDeliveryTrackingDto 재활용
        String dummyUserId = "notUsed"; // 지금은 안 씀
        UserDeliveryTrackingDto dto = deliveryService.getUserDeliveryTracking(orderId, dummyUserId);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    /**
     * 생산자: 송장번호 입력 + 배송 상태 변경
     * POST /api/producer/orders/{orderId}/delivery
     */
    @PostMapping("/{orderId}/delivery")
    public ResponseEntity<Void> updateDelivery(
            @PathVariable Long orderId,
            @RequestBody ProducerDeliveryUpdateRequest request
            /*, @AuthenticationPrincipal ProducerUser producer */
    ) {
        Long producerId = 1L; // TODO: 로그인된 생산자 ID로 교체
        request.setOrderId(orderId);
        deliveryService.updateDeliveryByProducer(request, producerId);
        return ResponseEntity.ok().build();
    }
}