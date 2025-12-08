package com.farmday.producer.service;

import com.farmday.membership.service.MembershipService;
import com.farmday.producer.domain.Producer;
import com.farmday.producer.dto.DailySalesDto;
import com.farmday.producer.dto.LowStockProductDto;
import com.farmday.producer.dto.OrderMembershipInfo;
import com.farmday.producer.dto.ProducerDashboardSummaryDto;
import com.farmday.producer.dto.ProducerOrderItemDto;
import com.farmday.producer.dto.ProducerOrderSummaryDto;
import com.farmday.producer.dto.ProducerProductItemDto;
import com.farmday.producer.dto.ProducerProductSaveRequest;
import com.farmday.producer.dto.ProducerProfileUpdateRequest;
import com.farmday.producer.dto.SalesItemDto;
import com.farmday.producer.dto.TopProductDto;
import com.farmday.producer.mapper.ProducerMapper;
import com.farmday.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProducerServiceImpl implements ProducerService {

    private final ProducerMapper producerMapper;
    private final UserMapper userMapper;
    private final MembershipService membershipService;

    @Override
    public void createProducerForSignup(Long userNo, Producer producer) {

        Long producerId = producerMapper.getNextProducerId();
        producer.setProducerId(producerId);
        producer.setUserNo(userNo);
        producer.setIsVerified("N");  // 기본값: 미인증

        producerMapper.insertProducer(producer);
    }

    @Override
    public List<Producer> getPendingProducers() {
        return producerMapper.findPendingProducers();
    }

    @Override
    public void approveProducer(Long producerId) {
        Producer producer = producerMapper.findById(producerId);
        if (producer == null) {
            throw new IllegalArgumentException("생산자를 찾을 수 없습니다.");
        }

        // PRODUCER 테이블 승인 처리
        producerMapper.approveProducer(producerId);

        // USERS.role = PRODUCER 로 변경
        userMapper.updateUserRole(producer.getUserNo(), "PRODUCER");
    }

    @Override
    public void rejectProducer(Long producerId, String rejectReason) {
        Producer producer = producerMapper.findById(producerId);
        if (producer == null) {
            throw new IllegalArgumentException("생산자를 찾을 수 없습니다.");
        }

        producerMapper.rejectProducer(producerId, rejectReason);

        // role 은 당분간 PRODUCER_PENDING 그대로 두거나, 필요하면 USER로 되돌릴 수도 있음
        // 여기선 그대로 두는 걸로.
    }

    @Override
    public Producer findByUserNo(Long userNo) {
        return producerMapper.findByUserNo(userNo);
    }

    @Override
    @Transactional(readOnly = true)
    public ProducerDashboardSummaryDto getDashboardSummary(Long producerId) {
        return producerMapper.getDashboardSummary(producerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LowStockProductDto> getLowStockProducts(Long producerId) {
        return producerMapper.findLowStockProducts(producerId);
    }

    // =========================
    // 판매관리 - 주문 목록 (요약)
    // =========================

    /**
     * 주문 아이템(ProducerOrderItemDto) 리스트를
     * 주문 단위 요약 DTO(ProducerOrderSummaryDto) 리스트로 변환
     */
    private List<ProducerOrderSummaryDto> toOrderSummary(List<ProducerOrderItemDto> items) {
        Map<Long, ProducerOrderSummaryDto> map = new LinkedHashMap<>();

        for (ProducerOrderItemDto item : items) {
            Long orderId = item.getOrderId();

            ProducerOrderSummaryDto summary = map.get(orderId);
            if (summary == null) {
                summary = new ProducerOrderSummaryDto();

                summary.setOrderId(orderId);
                // 주문번호는 일단 orderId 문자열로 사용 (추후 포맷 바꾸고 싶으면 여기서 처리)
                summary.setOrderNo(String.valueOf(orderId));
                summary.setOrderDate(item.getOrderDate());

                // 구매자는 수령인 기준으로
                summary.setBuyerName(item.getReceiverName());
                summary.setBuyerPhone(item.getReceiverPhone());
                summary.setBuyerAddr(item.getReceiverAddr());

                // 첫 번째 상품 이름
                summary.setFirstProductName(item.getProductName());

                summary.setItemCount(0);
                summary.setTotalAmount(0L);

                summary.setStatus(item.getOrderStatus());

                map.put(orderId, summary);
            }

            // 같은 주문에 속한 상품 개수/금액 누적
            summary.setItemCount(summary.getItemCount() + 1);
            summary.setTotalAmount(summary.getTotalAmount() + item.getLineTotalAmount());
        }

        return new ArrayList<>(map.values());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProducerOrderSummaryDto> getActiveOrders(Long producerId, String loginUserId) {
        List<ProducerOrderItemDto> items =
            producerMapper.findActiveOrderItemsByProducerId(producerId, loginUserId);
        return toOrderSummary(items);
    }

    @Override
    public List<ProducerOrderSummaryDto> getCompletedOrders(Long producerId, String loginUserId) {
        List<ProducerOrderItemDto> items =
                producerMapper.findCompletedOrderItemsByProducerId(producerId, loginUserId);
        return toOrderSummary(items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProducerOrderItemDto> getOrderItems(Long producerId, String loginUserId, Long orderId) {
        return producerMapper.findOrderItemsByProducerIdAndOrderId(producerId, loginUserId, orderId);
    }

    // =========================
    // 배송 상태 변경
    // =========================
    @Override
    @Transactional
    public void changeDeliveryStatus(Long producerId,
                                    String loginUserId,
                                    Long orderItemId,
                                    String deliveryStatus) {

        // 🔹 Mapper로 보낼 파라미터 맵
        Map<String, Object> param = new LinkedHashMap<>();
        param.put("producerId", producerId);
        param.put("loginUserId", loginUserId);
        param.put("orderItemId", orderItemId);
        param.put("deliveryStatus", deliveryStatus);

        int updated = producerMapper.updateDeliveryStatusByOrderItemId(param);
        if (updated == 0) {
            throw new IllegalStateException("배송 상태를 변경할 수 없습니다.");
        }

        // 🔸 배송완료 아닐 땐 멤버십 적립 로직 스킵
        if (!"배송완료".equals(deliveryStatus)) {
            return;
        }

        // 1) 주문/유저/결제금액 조회
        OrderMembershipInfo info =
                producerMapper.findOrderMembershipInfoByOrderItemId(orderItemId);

        if (info == null) {
            return;
        }

        Long orderId   = info.getOrderId();
        Long userNo    = info.getUserNo();
        Long payAmount = info.getPayAmount();

        // 2) 같은 주문 중 아직 배송완료 아닌 아이템 있으면 적립 보류
        int notDeliveredCount = producerMapper.countUndeliveredItemsByOrderId(orderId);
        if (notDeliveredCount > 0) {
            return;
        }

        // 3) 모든 아이템 배송완료 → 멤버십 적립
        membershipService.applyPaidOrder(userNo, payAmount);
    }

    // =========================
    // 매출 현황
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<DailySalesDto> getMonthlyDailySales(Long producerId) {
        return producerMapper.findMonthlyDailySalesByProducerId(producerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesItemDto> getMonthlySalesItems(Long producerId) {
        return producerMapper.findMonthlySalesItemsByProducerId(producerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductDto> getTopSellingProductsThisMonth(Long producerId, int limit) {
        return producerMapper.findTopSellingProductsThisMonthByProducerId(producerId, limit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProducerProductItemDto> getMyProductItems(Long producerId, String status) {
        return producerMapper.findProductItemsByProducerId(producerId, status);
    }

    @Override
    @Transactional
    public void updateMyProductDetail(Long producerId, Long detailId, String unitName, Integer price, Integer stockQty) {
        int updated = producerMapper.updateProductDetailByProducer(
                producerId, detailId, unitName, price, stockQty
        );
        if (updated == 0) {
            throw new IllegalStateException("해당 상품을 수정할 권한이 없거나 존재하지 않습니다.");
        }
    }

    @Override
    @Transactional
    public void updateDeliveryInfo(Long producerId, Long orderItemId, String carrierName, String trackingNumber) {

        if (producerId == null || orderItemId == null) {
            throw new IllegalArgumentException("producerId와 orderItemId는 필수입니다.");
        }

        producerMapper.updateDeliveryInfoByOrderItemId(producerId, orderItemId, carrierName, trackingNumber);
        
    }

    // 🔥 환불 내역
    @Override
    public List<ProducerOrderSummaryDto> getRefundOrders(Long producerId, String loginUserId) {
        List<ProducerOrderItemDto> items =
                producerMapper.findRefundOrderItemsByProducerId(producerId, loginUserId);
        return toOrderSummary(items);
    }

    // =========================
    // 상품 등록 (URL 기반)
    // =========================
    @Override
    @Transactional
    public ProducerProductItemDto createProduct(Long producerId, ProducerProductSaveRequest request) {

        Long productId = producerMapper.getNextProductId();
        Long detailId  = producerMapper.getNextProductDetailId();

        String mainImageUrl = request.getMainImageUrl(); // 프론트에서 이미 S3 업로드 후 받은 URL

        // 1) PRODUCT INSERT
        producerMapper.insertProductForProducer(
                producerId,
                productId,
                request.getProductName(),
                request.getBaseCategoryId(),
                request.getStatus(),
                mainImageUrl,          // PRODUCT.main_image
                request.getSummary()
        );

        // 2) PRODUCT_DETAIL INSERT
        producerMapper.insertProductDetail(
                productId,
                detailId,
                request.getGrade(),
                request.getUnitName(),
                request.getPrice(),
                request.getStockQty(),
                request.getOrigin(),
                request.getHarvestDate(),
                request.getExpireDate(),
                request.getDetailDesc()
        );

        // 3) PRODUCT_IMAGE INSERT
        int sortOrder = 1;

        // 3-1) 대표 이미지
        if (mainImageUrl != null && !mainImageUrl.trim().isEmpty()) {
            Long imageId = producerMapper.getNextProductImageId();
            producerMapper.insertProductImage(
                    productId,
                    imageId,
                    mainImageUrl,
                    "Y",       // 대표
                    sortOrder  // 1번
            );
            sortOrder++;
        }

        // 3-2) 상세 이미지들 (URL 리스트)
        List<String> descUrls = request.getDescriptionImageUrls();
        if (descUrls != null) {
            for (String url : descUrls) {
                if (url == null || url.trim().isEmpty()) continue;

                Long imageId = producerMapper.getNextProductImageId();
                producerMapper.insertProductImage(
                        productId,
                        imageId,
                        url,
                        "N",          // 대표 아님
                        sortOrder++
                );
            }
        }

        // 4) 등록된 상품 다시 조회
        return producerMapper.findProductItemByProductIdForProducer(producerId, productId);
    }

    // =========================
    // 상품 수정 (URL 기반)
    // =========================
    @Override
    @Transactional
    public ProducerProductItemDto updateProduct(Long producerId, Long productId, ProducerProductSaveRequest request) {

        String mainImageUrl = request.getMainImageUrl();

        // 1) PRODUCT UPDATE (요약/대표이미지 포함)
        producerMapper.updateProductByProducer(
                producerId,
                productId,
                request.getProductName(),
                request.getBaseCategoryId(),
                request.getStatus(),
                mainImageUrl,      // NVL 처리로 null이면 기존 유지하게 Mapper 쪽 구현 권장
                request.getSummary()
        );

        // 2) PRODUCT_DETAIL UPDATE
        producerMapper.updateMainProductDetailByProducer(
                producerId,
                productId,
                request.getGrade(),
                request.getUnitName(),
                request.getPrice(),
                request.getStockQty(),
                request.getOrigin(),
                request.getHarvestDate(),
                request.getExpireDate(),
                request.getDetailDesc()
        );

        // 3) 상세 이미지 재구성
        //   - 대표 이미지는 sort_order=1로 유지
        //   - 상세 이미지는 전부 삭제 후 새 URL 리스트로 다시 삽입
        producerMapper.deleteProductImagesByProductIdExceptMain(productId);

        List<String> descUrls = request.getDescriptionImageUrls();
        if (descUrls != null && !descUrls.isEmpty()) {
            int sortOrder = 2; // 대표가 1번

            for (String url : descUrls) {
                if (url == null || url.trim().isEmpty()) continue;

                Long imageId = producerMapper.getNextProductImageId();
                producerMapper.insertProductImage(
                        productId,
                        imageId,
                        url,
                        "N",
                        sortOrder++
                );
            }
        }

        // 4) 수정된 상품 다시 조회
        return producerMapper.findProductItemByProductIdForProducer(producerId, productId);
    }

    @Override
    @Transactional
    public void deleteProduct(Long producerId, Long productId) {

        // 주문 이력 있으면 하드 삭제 막는 게 안전함
        int orderCount = producerMapper.countOrderItemsByProductId(productId);
        if (orderCount > 0) {
            throw new IllegalStateException("주문 이력이 있는 상품은 삭제할 수 없습니다. 판매중지로 변경해 주세요.");
        }

        // FK 순서 고려해서 삭제: IMAGE → DETAIL → PRODUCT
        producerMapper.deleteProductImagesByProductId(producerId, productId);
        producerMapper.deleteProductDetailsByProductId(producerId, productId);
        producerMapper.deleteProductByProducer(producerId, productId);
    }

    // =========================
    // 생산자 프로필 수정
    // =========================
    @Override
    @Transactional
    public void updateProducerProfile(Long producerId, ProducerProfileUpdateRequest req) {

        if (producerId == null) {
            throw new IllegalArgumentException("producerId는 필수입니다.");
        }

        Map<String, Object> params = new LinkedHashMap<>();
        params.put("producerId", producerId);

        // USERS 쪽
        params.put("name",  req.getName());
        params.put("email", req.getEmail());
        params.put("phone", req.getPhone());
        params.put("addr",  req.getAddr());
        params.put("photo", req.getPhoto());

        // PRODUCER 쪽
        params.put("bizName",        req.getBizName());
        params.put("bizAddr",        req.getBizAddr());
        params.put("bizPhone",       req.getBizPhone());
        params.put("bankName",       req.getBankName());
        params.put("bankAccountNo",  req.getBankAccountNo());
        params.put("accountHolder",  req.getAccountHolder());

        int updated = producerMapper.updateProducerFullProfile(params);
        if (updated == 0) {
            // producerId가 잘못됐거나, USERS/PRODUCER 매칭이 안 되는 경우
            throw new IllegalStateException("프로필을 수정할 수 없습니다.");
        }

    }

    @Override
    public void updateRefundStatus(Long producerId, Long orderItemId, String refundStatus) {
        // 1) 아이템 상태 변경 (R1 / E2)
        producerMapper.updateRefundStatusByOrderItemId(producerId, orderItemId, refundStatus);

        // 2) 해당 주문 헤더의 updated_date 갱신
        producerMapper.touchOrderUpdatedDateByItemId(producerId, orderItemId);
    }

    @Override
    public boolean existsStoreByProducerId(Long producerId) {
        int count = producerMapper.existsStoreByProducerId(producerId);
        return count > 0;
    }

}