// src/main/java/com/farmday/delivery/controller/UserDeliveryController.java
package com.farmday.delivery.controller;

import com.farmday.delivery.dto.UserDeliveryTrackingDto;
import com.farmday.delivery.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class UserDeliveryController {

    private final DeliveryService deliveryService;

    /**
     * 소비자: 주문 상세에서 배송 정보 조회
     * GET /api/orders/{orderId}/delivery
     */
    @GetMapping("/{orderId}/delivery")
    public ResponseEntity<UserDeliveryTrackingDto> getDelivery(
            @PathVariable Long orderId
            /*, @AuthenticationPrincipal CustomUser user */
    ) {
        String currentUserId = "dummyUser"; // TODO: 로그인 유저 ID로 교체
        UserDeliveryTrackingDto dto = deliveryService.getUserDeliveryTracking(orderId, currentUserId);

        if (dto == null) {
            return ResponseEntity.noContent().build(); // 배송 정보 아직 없음
        }
        return ResponseEntity.ok(dto);
    }
}