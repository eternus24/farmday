package com.farmday.producer.mapper;

import com.farmday.producer.domain.Producer;
import com.farmday.producer.dto.DailySalesDto;
import com.farmday.producer.dto.LowStockProductDto;
import com.farmday.producer.dto.ProducerDashboardSummaryDto;
import com.farmday.producer.dto.ProducerOrderItemDto;
import com.farmday.producer.dto.ProducerOrderSummaryDto;
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

    void rejectProducer(@Param("producerId") Long producerId,
                        @Param("rejectReason") String rejectReason);
    
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

}