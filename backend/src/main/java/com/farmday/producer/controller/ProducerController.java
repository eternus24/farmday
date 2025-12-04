package com.farmday.producer.controller;

import com.farmday.mypage.MembershipGradeDTO;
import com.farmday.mypage.OrdersCanceledDTO;
import com.farmday.orders.OrdersDTO;
import com.farmday.orders.OrdersItemDTO;
import com.farmday.orders.OrdersService;
import com.farmday.producer.domain.Producer;
import com.farmday.producer.dto.DailySalesDto;
import com.farmday.producer.dto.LowStockProductDto;
import com.farmday.producer.dto.ProducerDashboardSummaryDto;
import com.farmday.producer.dto.ProducerMonthlySalesResponseDto;
import com.farmday.producer.dto.ProducerOrderItemDto;
import com.farmday.producer.dto.ProducerOrderSummaryDto;
import com.farmday.producer.dto.ProducerProductItemDto;
import com.farmday.producer.dto.ProducerProductSaveRequest;
import com.farmday.producer.dto.ProducerProfileUpdateRequest;
import com.farmday.producer.dto.SalesItemDto;
import com.farmday.producer.dto.TopProductDto;
import com.farmday.producer.service.ProducerService;
import com.farmday.user.domain.User;
import com.farmday.user.service.UserService;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/producer")
public class ProducerController {

    private final UserService userService;
    private final ProducerService producerService;
    private final OrdersService ordersService;

    @GetMapping("/me")
    public ResponseEntity<ProducerMeResponse> getMyProducerInfo(
            @AuthenticationPrincipal String loginUserId
    ) {
        String userId = loginUserId;
        User user = userService.findByUserId(userId);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.notFound().build();
        }

        Long producerId = producer.getProducerId();

        // 🔥 여기서 스토어 존재 여부 체크
        boolean hasStore = producerService.existsStoreByProducerId(producerId);

        ProducerMeResponse dto = new ProducerMeResponse(
                // 유저
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getPhoto(),
                user.getAddr(),

                // 생산자
                producer.getProducerId(),
                producer.getBizName(),
                producer.getBizNo(),
                producer.getBizAddr(),
                producer.getBizPhone(),

                producer.getBankName(),
                producer.getBankAccountNo(),
                producer.getAccountHolder(),
                producer.getIsVerified(),
                hasStore   // ✅ 여기! 이제 진짜 값으로 내려감
        );

        return ResponseEntity.ok(dto);
    }

    // =========================
    // 생산자 프로필 수정
    // (이름/연락처/주소/이메일 + 사업장/계좌)
    // =========================
    @PatchMapping("/me")
    public ResponseEntity<Void> updateMyProducerProfile(
            @AuthenticationPrincipal String loginUserId,
            @RequestBody ProducerProfileUpdateRequest request
    ) {
        if (loginUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long producerId = producer.getProducerId();

        // 서비스에서 USERS + PRODUCER 동시에 UPDATE
        producerService.updateProducerProfile(producerId, request);

        return ResponseEntity.noContent().build();
    }

    @Data
    public static class UpdatePhotoRequest {
        private String photoUrl;
    }

    @PatchMapping( value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateMyProfilePhoto( @AuthenticationPrincipal String loginUserId, @RequestParam("file") MultipartFile file) {
        System.out.println(">>> /api/producer/me/photo loginUserId = " + loginUserId);
        System.out.println("file name = " + file.getOriginalFilename());

        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // 🔹 1. 저장할 기본 경로 (D 드라이브 고정)
            String uploadDir = "D:/farmday/uploads/profile";   // ★ 여기만 바꿔!

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String ext = StringUtils.getFilenameExtension(originalFilename);
            if (ext == null) {
                ext = "jpg";
            }

            String filename = "user-" + user.getUserNo() + "." + ext;
            Path filePath = uploadPath.resolve(filename);

            file.transferTo(filePath.toFile());

            String photoUrl = "/uploads/profile/" + filename;
            userService.updateUserPhoto(user.getUserNo(), photoUrl);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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

    // 환불 상태 변경 (R1: 환불완료, E2: 환불불가)
    @PatchMapping("/orders/{orderItemId}/refund-status")
    public ResponseEntity<Void> updateRefundStatus(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long orderItemId,
            @RequestParam("refundStatus") String refundStatus
    ) throws Exception {
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

        OrdersItemDTO ordersItem = ordersService.findOrdersItemById(orderItemId.intValue());
        String user_id = ordersItem.getUser_id();

        String status = ordersItem.getOrder_status();

        if (!status.equals("B1")) {
            return ResponseEntity.badRequest().build();
        }

        if (refundStatus.equals("E2")) { //환불 거부 -> 구매 확정 처리

            MembershipGradeDTO membershipGrade = ordersService.findMembershipGradeInfo(ordersService.findUserMembershipInfo(user_id));

            double point_rate = membershipGrade.getPoint_rate();
            
            int earned_points = (int)(ordersItem.getLine_total_amount() * point_rate * 0.01);
            int current_points = ordersService.findUserPoints(user_id);
            int updated_points = current_points + earned_points;

            ordersService.updateUserPoints(user_id, updated_points);

            System.out.println("적립금 "+earned_points+"점을 얻어 총 "+updated_points+"점이 되었습니다.");

            ordersService.changeDeliveryStatus(orderItemId.intValue(), "배송완료");

        } else if (refundStatus.equals("R1")) { //환불 승인 -> 구매 취소 처리

            OrdersDTO order = ordersService.findOrdersByOrderId(ordersItem.getOrder_id());

            int product_total_amount = order.getProduct_total_amount();
            int order_total_amount = order.getOrder_total_amount();
            int item_total_amount = ordersItem.getLine_total_amount();

            int refund_amount = order_total_amount * item_total_amount / product_total_amount;
            int refund_points = order.getUsed_points() * item_total_amount / product_total_amount;

            int current_points = ordersService.findUserPoints(user_id);
            int updated_points = current_points + refund_points;
            ordersService.updateUserPoints(user_id, updated_points);

            System.out.println("환불로 인해 "+refund_points+"점을 반환받아 "+updated_points+"점이 되었습니다.");

            //orders에 있는 OrdersCanceledDTO는 중복이라 삭제했음, mypage의 DTO로 해야 함
            OrdersCanceledDTO cancel = new OrdersCanceledDTO();
            cancel.setOrder_item_id(orderItemId.intValue());
            cancel.setProduct_id(ordersItem.getProduct_id());
            cancel.setUser_id(user_id);
            cancel.setCancel_reason("상품 불량");
            cancel.setRefund_amount(refund_amount);

            ordersService.insertOrdersItemIntoCancel(cancel);

            ordersService.changeDeliveryStatus(orderItemId.intValue(), "환불완료");

        } else {
            return ResponseEntity.badRequest().build();
        }

        // 3) 서비스 호출 (본인 상품인지까지 안에서 체크)
        producerService.updateRefundStatus(producerId, orderItemId, refundStatus);

        return ResponseEntity.ok().build();
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2) 생산자 검증
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long producerId = producer.getProducerId();

        // 3) 내 상품 목록 조회
        List<ProducerProductItemDto> items =
                producerService.getMyProductItems(producerId, status);

        return ResponseEntity.ok(items);
    }

    // =========================
    // 상품관리 - 옵션 수정 (규격/가격/재고)
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2) 생산자 검증
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long producerId = producer.getProducerId();

        // 3) 서비스 호출
        producerService.updateMyProductDetail(
                producerId,
                detailId,
                request.getUnitName(),
                request.getPrice(),
                request.getStockQty()
        );

        return ResponseEntity.ok().build();
    }

    // =========================
    // 상품관리 - 상품 등록 (모달)
    // =========================
   @PostMapping("/products")
    public ResponseEntity<ProducerProductItemDto> createProduct(
            @AuthenticationPrincipal String loginUserId,
            @RequestBody ProducerProductSaveRequest request
    ) {

        // 1) 로그인 유저 검증
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2) 생산자 검증
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long producerId = producer.getProducerId();

        // ... 로그인/생산자 체크 동일
        ProducerProductItemDto dto =
                producerService.createProduct(producerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // =========================
    // 상품관리 - 상품 정보 수정 (모달)
    // =========================
    @PatchMapping("/products/{productId}")
    public ResponseEntity<ProducerProductItemDto> updateProduct(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long productId,
            @RequestBody ProducerProductSaveRequest request
    ) {
        // 1) 로그인 유저 검증
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2) 생산자 검증
        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long producerId = producer.getProducerId();

        // 3) 서비스 호출
        ProducerProductItemDto dto =
                producerService.updateProduct(producerId, productId, request);

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @AuthenticationPrincipal String loginUserId,
            @PathVariable Long productId
    ) {
        User user = userService.findByUserId(loginUserId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Producer producer = producerService.findByUserNo(user.getUserNo());
        if (producer == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long producerId = producer.getProducerId();

        producerService.deleteProduct(producerId, productId);

        return ResponseEntity.noContent().build();
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
        private String addr;

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