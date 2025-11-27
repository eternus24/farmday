package com.farmday.producer.service;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.dto.DailySalesDto;
import com.farmday.producer.dto.LowStockProductDto;
import com.farmday.producer.dto.ProducerDashboardSummaryDto;
import com.farmday.producer.dto.ProducerOrderItemDto;
import com.farmday.producer.dto.ProducerOrderSummaryDto;
import com.farmday.producer.dto.ProducerProductItemDto;
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
    public List<ProducerOrderSummaryDto> getActiveOrders(Long producerId) {
        List<ProducerOrderItemDto> items =
                producerMapper.findActiveOrderItemsByProducerId(producerId);
        return toOrderSummary(items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProducerOrderSummaryDto> getCompletedOrders(Long producerId) {
        List<ProducerOrderItemDto> items =
                producerMapper.findCompletedOrderItemsByProducerId(producerId);
        return toOrderSummary(items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProducerOrderItemDto> getOrderItems(Long producerId, Long orderId) {
        return producerMapper.findOrderItemsByProducerIdAndOrderId(producerId, orderId);
    }

    // =========================
    // 배송 상태 변경
    // =========================

    @Override
    @Transactional
    public void changeDeliveryStatus(Long producerId, Long orderItemId, String deliveryStatus) {
        int updated = producerMapper.updateDeliveryStatusByOrderItemId(producerId, orderItemId, deliveryStatus);
        if (updated == 0) {
            // 이 orderItem이 이 생산자의 상품이 아니거나 없는 경우
            throw new IllegalStateException("배송 상태를 변경할 수 없습니다.");
        }
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
    @Transactional(readOnly = true)
    public List<ProducerOrderSummaryDto> getRefundOrders(Long producerId) {
        // 1) 환불 아이템들 조회 (B1, R1)
        List<ProducerOrderItemDto> items =
                producerMapper.findRefundOrderItemsByProducerId(producerId);

        // 2) 이미 잘 쓰던 toOrderSummary 재사용
        return toOrderSummary(items);
    }

}