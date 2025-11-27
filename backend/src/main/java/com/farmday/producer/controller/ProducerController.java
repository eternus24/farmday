package com.farmday.producer.controller;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.dto.DailySalesDto;
import com.farmday.producer.dto.LowStockProductDto;
import com.farmday.producer.dto.ProducerDashboardSummaryDto;
import com.farmday.producer.dto.ProducerMonthlySalesResponseDto;
import com.farmday.producer.dto.ProducerOrderItemDto;
import com.farmday.producer.dto.ProducerOrderSummaryDto;
import com.farmday.producer.dto.ProducerProductItemDto;
import com.farmday.producer.dto.SalesItemDto;
import com.farmday.producer.dto.TopProductDto;
import com.farmday.producer.service.ProducerService;
import com.farmday.user.domain.User;
import com.farmday.user.service.UserService;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/producer")
public class ProducerController {

    private final UserService userService;
    private final ProducerService producerService;

    @GetMapping("/me")
    public ResponseEntity<ProducerMeResponse> getMyProducerInfo(
            @AuthenticationPrincipal String loginUserId
    ) {

        System.out.println(">>> /api/producer/me loginUserId = " + loginUserId);

        String userId = loginUserId;
        User user = userService.findByUserId(userId);

        if (user == null) {
            System.out.println(">>> USER NOT FOUND for userId = " + userId);
            return ResponseEntity.notFound().build();
        }

        System.out.println(">>> FOUND USER: userNo = " + user.getUserNo());

        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            System.out.println(">>> PRODUCER NOT FOUND for userNo = " + user.getUserNo());
            return ResponseEntity.notFound().build();
        }

        System.out.println(">>> FOUND PRODUCER: producerId = " + producer.getProducerId());

        // DTO 생성
        ProducerMeResponse dto = new ProducerMeResponse(
                // 🔹 유저 정보
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getPhoto(),

                // 🔹 기존 Producer 정보 그대로 유지
                producer.getProducerId(),
                producer.getBizName(),   // farmName
                producer.getBizNo(),
                producer.getBizAddr(),
                producer.getBizPhone(),

                producer.getBankName(),
                producer.getBankAccountNo(),
                producer.getAccountHolder(),
                producer.getIsVerified(),

                // 스토어 여부는 당장은 false
                false
        );

        return ResponseEntity.ok(dto);
    }

    @Data
    public static class UpdatePhotoRequest {
        private String photoUrl;
    }

    @PatchMapping("/me/photo")
    public ResponseEntity<Void> updateMyProfilePhoto(
            @AuthenticationPrincipal String loginUserId,
            @RequestBody UpdatePhotoRequest request
    ) {
        System.out.println(">>> /api/producer/me/photo loginUserId = " + loginUserId);

        // 1) 로그인 유저 조회
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2) USERS.photo 업데이트
        userService.updateUserPhoto(user.getUserNo(), request.getPhotoUrl());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal String loginUserId) {

        User user = userService.findByUserId(loginUserId);
        
        if (user == null) {
            return ResponseEntity.status(401).body("유저 없음");
        }

        Producer producer = producerService.findByUserNo(user.getUserNo());

        if (producer == null) {
            return ResponseEntity.status(403).body("생산자 권한이 없습니다.");
        }

        Long producerId = producer.getProducerId();

        ProducerDashboardSummaryDto summary =
                producerService.getDashboardSummary(producerId);

        List<LowStockProductDto> lowStocks =
                producerService.getLowStockProducts(producerId);

        return ResponseEntity.ok(new ProducerDashboardResponse(summary, lowStocks));
    }

    // =========================
    // 판매관리 - 주문 목록
    // =========================
    @GetMapping("/orders")
    public ResponseEntity<List<ProducerOrderSummaryDto>> getOrders(
            @AuthenticationPrincipal String loginUserId,
            @RequestParam(name = "type", defaultValue = "ACTIVE") String type
    ) {
        // 1) 로그인 유저 검증
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // 2) 생산자 검증
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(403).build();
        }

        Long producerId = producer.getProducerId();

        // 3) 타입에 따라 분기
        if ("COMPLETED".equalsIgnoreCase(type)) {
            // 완료된 판매 내역
            return ResponseEntity.ok(producerService.getCompletedOrders(producerId));

        } else if ("REFUNDS".equalsIgnoreCase(type)) {
            // ✅ 환불 내역 탭용
            return ResponseEntity.ok(producerService.getRefundOrders(producerId));

        } else {
            // 기본: ACTIVE (신규/진행 중)
            return ResponseEntity.ok(producerService.getActiveOrders(producerId));
        }
    }

    // 주문 상세 조회
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<List<ProducerOrderItemDto>> getOrderDetail(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long orderId
    ) {
        // 1) 로그인 유저 확인
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // 2) 생산자 확인
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(403).build();
        }

        Long producerId = producer.getProducerId();

        // 3) 주문 상세 조회 (본인 상품인지까지 Mapper에서 검증)
        List<ProducerOrderItemDto> items =
                producerService.getOrderItems(producerId, orderId);

        if (items.isEmpty()) {
            // 이 생산자의 주문이 아니거나 존재하지 않는 주문
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(items);
    }

    // =========================
    // 배송 상태 변경
    // =========================
    @PatchMapping("/orders/{orderItemId}/delivery-status")
    public ResponseEntity<Void> updateDeliveryStatus(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long orderItemId,
            @RequestParam String deliveryStatus
    ) {
        // 1) 로그인 유저 검증
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // 2) 생산자 검증
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(403).build();
        }

        Long producerId = producer.getProducerId();

        // 3) 배송 상태 변경
        producerService.changeDeliveryStatus(producerId, orderItemId, deliveryStatus);

        return ResponseEntity.ok().build();
    }

    // =========================
    // 송장 정보 수정
    // =========================
    @PatchMapping("/orders/{orderItemId}/delivery-info")
    public ResponseEntity<Void> updateDeliveryInfo(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long orderItemId,
            @RequestBody UpdateDeliveryInfoRequest request
    ) {

        if (loginUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 1) 로그인 유저 → User 조회
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2) User의 userNo로 Producer 조회
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            // 생산자 등록 안 된 계정이면 403
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long producerId = producer.getProducerId();

        // 3) 서비스 호출 (권한 체크는 Mapper의 EXISTS 조건으로 한 번 더 보장)
        producerService.updateDeliveryInfo(
                producerId,
                orderItemId,
                request.getCarrierName(),
                request.getTrackingNumber()
        );

        return ResponseEntity.noContent().build();
    }

    // =========================
    // 매출 현황 - 이번달
    // =========================
    @GetMapping("/sales/monthly")
    public ResponseEntity<ProducerMonthlySalesResponseDto> getMonthlySales(
            @AuthenticationPrincipal String loginUserId
    ) {
        // 1) 로그인 유저 검증
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // 2) 생산자 검증
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(403).build();
        }

        Long producerId = producer.getProducerId();

        // 3) 매출 데이터 조회
        List<DailySalesDto> dailySales = producerService.getMonthlyDailySales(producerId);
        List<SalesItemDto> salesItems = producerService.getMonthlySalesItems(producerId);
        List<TopProductDto> topProducts = producerService.getTopSellingProductsThisMonth(producerId, 5);

        ProducerMonthlySalesResponseDto dto =
                new ProducerMonthlySalesResponseDto(dailySales, salesItems, topProducts);

        return ResponseEntity.ok(dto);
    }

    // =========================
    // 상품관리 - 내 상품 목록
    // =========================
    @GetMapping("/products")
    public ResponseEntity<List<ProducerProductItemDto>> getMyProducts(
            @AuthenticationPrincipal String loginUserId,
            @RequestParam(name = "status", required = false) String status
    ) {
        // 1) 로그인 유저 검증
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(401).build();   // 또는 body("유저 없음")
        }

        // 2) 생산자 검증
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(403).build();   // 또는 body("생산자 권한이 없습니다.")
        }

        Long producerId = producer.getProducerId();

        // 3) 내 상품 목록 조회
        List<ProducerProductItemDto> items =
                producerService.getMyProductItems(producerId, status);

        return ResponseEntity.ok(items);
    }

    // =========================
    // 상품관리 - 옵션 수정
    // =========================
    @PatchMapping("/products/details/{detailId}")
    public ResponseEntity<Void> updateProductDetail(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long detailId,
            @RequestBody UpdateProductDetailRequest request
    ) {
        // 1) 로그인 유저 검증
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // 2) 생산자 검증
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(403).build();
        }

        Long producerId = producer.getProducerId();

        // 3) 서비스 호출 (권한 + 존재 여부는 서비스/쿼리에서 체크)
        producerService.updateMyProductDetail(
                producerId,
                detailId,
                request.getUnitName(),
                request.getPrice(),
                request.getStockQty()
        );

        return ResponseEntity.ok().build();
    }

    @Data
    @AllArgsConstructor
    static class ProducerDashboardResponse {
        private ProducerDashboardSummaryDto summary;
        private List<LowStockProductDto> lowStockProducts;
    }

    @Data
    @AllArgsConstructor
    static class UpdateDeliveryInfoRequest {
        private String carrierName;
        private String trackingNumber;

        public UpdateDeliveryInfoRequest() {
        }
    }

    @Data
    @AllArgsConstructor
    static class ProducerMeResponse {

        // 🔹 유저 정보
        private String userId;
        private String name;
        private String email;
        private String phone;
        private String photoUrl;

        // 🔹 생산자 정보
        private Long producerId;
        private String farmName;
        private String bizNo;
        private String farmAddr;
        private String farmPhone;

        // 🔹 기존 Producer 정보 유지
        private String bankName;
        private String bankAccountNo;
        private String accountHolder;
        private String isVerified;

        // 🔹 추가 정보
        private boolean hasStore;
    }

    @Data
    static class UpdateProductDetailRequest {
        private String unitName;
        private Integer price;
        private Integer stockQty;
    }

}