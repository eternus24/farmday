package com.farmday.producer.service;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.dto.DailySalesDto;
import com.farmday.producer.dto.LowStockProductDto;
import com.farmday.producer.dto.ProducerDashboardSummaryDto;
import com.farmday.producer.dto.ProducerOrderItemDto;
import com.farmday.producer.dto.ProducerOrderSummaryDto;
import com.farmday.producer.dto.ProducerProductItemDto;
import com.farmday.producer.dto.ProducerProductSaveRequest;
import com.farmday.producer.dto.ProducerProfileUpdateRequest;
import com.farmday.producer.dto.SalesItemDto;
import com.farmday.producer.dto.TopProductDto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface ProducerService {

    // 회원가입 시 PRODUCER 생성
    void createProducerForSignup(Long userNo, Producer producer);

    // 승인 대기 목록
    List<Producer> getPendingProducers();

    // 승인
    void approveProducer(Long producerId);

    // 반려
    void rejectProducer(Long producerId, String rejectReason);

    Producer findByUserNo(Long userNo);

    ProducerDashboardSummaryDto getDashboardSummary(Long producerId);

    List<LowStockProductDto> getLowStockProducts(Long producerId);

    // 판매관리 - 주문 목록
    List<ProducerOrderSummaryDto> getActiveOrders(Long producerId);

    List<ProducerOrderSummaryDto> getCompletedOrders(Long producerId);

    // 배송 상태 변경
    void changeDeliveryStatus(Long producerId, Long orderItemId, String deliveryStatus);

    // 매출 현황
    List<DailySalesDto> getMonthlyDailySales(Long producerId);

    List<SalesItemDto> getMonthlySalesItems(Long producerId);

    List<TopProductDto> getTopSellingProductsThisMonth(Long producerId, int limit);
    
    // 상품관리 - 내 상품 목록 조회
    List<ProducerProductItemDto> getMyProductItems(Long producerId, String status);

    // 상품관리 - 옵션 수정
    void updateMyProductDetail(Long producerId, Long detailId, String unitName, Integer price, Integer stockQty);

    List<ProducerOrderItemDto> getOrderItems(Long producerId, Long orderId);

    void updateDeliveryInfo(Long producerId, Long orderItemId, String carrierName, String trackingNumber);

    // 🔥 새로 추가: 환불 내역 조회
    List<ProducerOrderSummaryDto> getRefundOrders(Long producerId);

    // 상품 등록 (대표 이미지 + 상세 이미지 여러 장)
    ProducerProductItemDto createProduct( Long producerId, ProducerProductSaveRequest request, MultipartFile mainImageFile, List<MultipartFile> descriptionImageFiles);

    // 상품 수정 (대표 이미지 변경 + 상세 이미지 추가/교체 용)
    ProducerProductItemDto updateProduct( Long producerId, Long productId, ProducerProductSaveRequest request, MultipartFile mainImageFile, List<MultipartFile> descriptionImageFiles);

    // 상품 삭제 (또는 상태 OFF 처리)
    void deleteProduct(Long producerId, Long productId);

    void updateProducerProfile(Long producerId, ProducerProfileUpdateRequest request);

}