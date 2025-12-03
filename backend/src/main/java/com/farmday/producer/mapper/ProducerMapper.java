package com.farmday.producer.mapper;

import com.farmday.admin.dto.AdminProducerDto;
import com.farmday.producer.domain.Producer;
import com.farmday.producer.dto.DailySalesDto;
import com.farmday.producer.dto.LowStockProductDto;
import com.farmday.producer.dto.OrderMembershipInfo;
import com.farmday.producer.dto.ProducerDashboardSummaryDto;
import com.farmday.producer.dto.ProducerOrderItemDto;
import com.farmday.producer.dto.ProducerProductItemDto;
import com.farmday.producer.dto.SalesItemDto;
import com.farmday.producer.dto.TopProductDto;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ProducerMapper {

    Long getNextProducerId();

    int insertProducer(Producer producer);

    Producer findByUserNo(@Param("userNo") Long userNo);

    Producer findById(@Param("producerId") Long producerId);

    List<Producer> findPendingProducers();

    void approveProducer(@Param("producerId") Long producerId);

    ProducerDashboardSummaryDto getDashboardSummary(@Param("producerId") Long producerId);

    List<LowStockProductDto> findLowStockProducts(@Param("producerId") Long producerId);

    // 판매관리 - 주문 목록
    List<ProducerOrderItemDto> findActiveOrderItemsByProducerId(@Param("producerId") Long producerId);

    List<ProducerOrderItemDto> findCompletedOrderItemsByProducerId(@Param("producerId") Long producerId);

    // 배송 상태 변경
    int updateDeliveryStatusByOrderItemId(@Param("producerId") Long producerId, @Param("orderItemId") Long orderItemId, @Param("deliveryStatus") String deliveryStatus);

    // 매출 현황
    List<DailySalesDto> findMonthlyDailySalesByProducerId(@Param("producerId") Long producerId);

    List<SalesItemDto> findMonthlySalesItemsByProducerId(@Param("producerId") Long producerId);

    List<TopProductDto> findTopSellingProductsThisMonthByProducerId(@Param("producerId") Long producerId, @Param("limit") int limit);

    // ======================
    // 상품관리
    // ======================

    List<ProducerProductItemDto> findProductItemsByProducerId(
            @Param("producerId") Long producerId,
            @Param("status") String status
    );

    int updateProductDetailByProducer( @Param("producerId") Long producerId, @Param("detailId") Long detailId, @Param("unitName") String unitName, @Param("price") Integer price, @Param("stockQty") Integer stockQty);
    
    int updateDeliveryStatusByOrderItemId(Map<String, Object> param);
    
    List<ProducerOrderItemDto> findOrderItemsByProducerIdAndOrderId( @Param("producerId") Long producerId, @Param("orderId") Long orderId);

    void updateDeliveryInfoByOrderItemId(@Param("producerId") Long producerId, @Param("orderItemId") Long orderItemId, @Param("carrierName") String carrierName, @Param("trackingNumber") String trackingNumber);

    List<ProducerOrderItemDto> findRefundOrderItemsByProducerId(Long producerId);

    // =======================
    // 상품관리 - 시퀀스
    // =======================
    Long getNextProductId();

    Long getNextProductDetailId();

    Long getNextProductImageId();


    // =======================
    // 상품관리 - 상품 등록
    // =======================
    int insertProductForProducer(
        @Param("producerId") Long producerId,
        @Param("productId") Long productId,
        @Param("productName") String productName,
        @Param("baseCategoryId") Long baseCategoryId,
        @Param("status") String status,
        @Param("mainImage") String mainImage,
        @Param("summary") String summary
    );

    int insertProductDetail(
        @Param("productId") Long productId,
        @Param("detailId") Long detailId,
        @Param("grade") String grade,
        @Param("unitName") String unitName,
        @Param("price") Integer price,
        @Param("stockQty") Integer stockQty,
        @Param("origin") String origin,          // ★ 여기로 이동
        @Param("harvestDate") String harvestDate,
        @Param("expireDate") String expireDate,
        @Param("detailDesc") String detailDesc
    );

    int insertProductImage(
            @Param("productId") Long productId,
            @Param("imageId") Long imageId,
            @Param("imageUrl") String imageUrl,
            @Param("isMain") String isMain,
            @Param("sortOrder") Integer sortOrder
    );

    // 등록/수정 후 단건 조회
    ProducerProductItemDto findProductItemByProductIdForProducer(
            @Param("producerId") Long producerId,
            @Param("productId") Long productId
    );

    // =======================
    // 상품관리 - 상품 수정
    // =======================
    int updateProductByProducer(
        @Param("producerId") Long producerId,
        @Param("productId") Long productId,
        @Param("productName") String productName,
        @Param("baseCategoryId") Long baseCategoryId,
        @Param("status") String status,
        @Param("mainImage") String mainImage,
        @Param("summary") String summary
    );

    int updateMainProductDetailByProducer(
        @Param("producerId") Long producerId,
        @Param("productId") Long productId,
        @Param("grade") String grade,
        @Param("unitName") String unitName,
        @Param("price") Integer price,
        @Param("stockQty") Integer stockQty,
        @Param("origin") String origin,          // ★ 여기도
        @Param("harvestDate") String harvestDate,
        @Param("expireDate") String expireDate,
        @Param("detailDesc") String detailDesc
    );

    // =======================
    // 상품관리 - 삭제(판매중지)
    // =======================
    int deleteProductImagesByProductId(
        @Param("producerId") Long producerId,
        @Param("productId") Long productId
    );

    int deleteProductDetailsByProductId(
            @Param("producerId") Long producerId,
            @Param("productId") Long productId
    );

    int deleteProductByProducer(
            @Param("producerId") Long producerId,
            @Param("productId") Long productId
    );

    // (선택) 주문 이력 있는지 체크
    int countOrderItemsByProductId(@Param("productId") Long productId);

    int updateProducerFullProfile(Map<String, Object> params);

    void deleteProductImagesByProductIdExceptMain(Long productId);

    int updateRefundStatusByOrderItemId(@Param("producerId") Long producerId,
                                        @Param("orderItemId") Long orderItemId,
                                        @Param("refundStatus") String refundStatus);

    int touchOrderUpdatedDateByItemId(@Param("producerId") Long producerId,
                                      @Param("orderItemId") Long orderItemId);

    // 관리자용: 상태별 생산자 목록 조회
    List<AdminProducerDto> findAdminProducersByStatus(@Param("status") String status);

    // 승인 시 USERS.role 변경
    void approveProducerUserRole(@Param("producerId") Long producerId);

    // 승인 시 PRODUCER is_verified, verified_at 갱신
    void markProducerVerified(@Param("producerId") Long producerId);

    // 반려 시 USERS.role 일반 USER로
    void rejectProducerUserRole(@Param("producerId") Long producerId);

    // 반려 시 PRODUCER 반려 사유 저장
    void rejectProducer(@Param("producerId") Long producerId,
                        @Param("rejectReason") String rejectReason);
    
    // 배송상태 변경 후 멤버십 적립용 정보 조회
    OrderMembershipInfo findOrderMembershipInfoByOrderItemId(@Param("orderItemId") Long orderItemId);

    // 해당 주문에서 아직 배송완료가 아닌 아이템 개수
    int countUndeliveredItemsByOrderId(@Param("orderId") Long orderId);

    int existsStoreByProducerId(@Param("producerId") Long producerId);
    
}