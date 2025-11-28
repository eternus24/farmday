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
import com.farmday.producer.mapper.ProducerMapper;
import com.farmday.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProducerServiceImpl implements ProducerService {

    private final ProducerMapper producerMapper;
    private final UserMapper userMapper;

    // ★ 서버 파일 저장 경로 & 외부에서 접근하는 베이스 URL
    private static final String UPLOAD_DIR = "D:/farmday/uploads";
    private static final String SERVER_BASE_URL = "http://192.168.0.20:8080";

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

    private String saveImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.lastIndexOf(".") != -1) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }

            String storedFileName = UUID.randomUUID().toString() + ext;

            // 로컬 디스크에 저장
            Path savePath = Paths.get(UPLOAD_DIR, storedFileName);
            Files.createDirectories(savePath.getParent());
            file.transferTo(savePath.toFile());

            // ★ DB에 저장할 값 = 프론트에서 그대로 <img src=...> 로 쓸 풀 URL
            return SERVER_BASE_URL + "/uploads/" + storedFileName;
        } catch (Exception e) {
            throw new RuntimeException("상품 이미지 저장 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    @Transactional
    public ProducerProductItemDto createProduct(Long producerId, ProducerProductSaveRequest request, MultipartFile mainImageFile, List<MultipartFile> descriptionImageFiles) {

        Long productId = producerMapper.getNextProductId();
        Long detailId  = producerMapper.getNextProductDetailId();

        // 1) 대표 이미지 저장
        String mainImagePath = saveImageFile(mainImageFile);

        // 2) PRODUCT INSERT (summary 포함)
        producerMapper.insertProductForProducer(
            producerId,
            productId,
            request.getProductName(),
            request.getBaseCategoryId(),
            request.getStatus(),
            mainImagePath,
            request.getSummary()          // ★ 여기까지만
        );

        // 3) PRODUCT_DETAIL INSERT (상세 설명 포함)
        producerMapper.insertProductDetail(
            productId,
            detailId,
            request.getGrade(),
            request.getUnitName(),
            request.getPrice(),
            request.getStockQty(),
            request.getOrigin(),          // ★ 여기서 저장
            request.getHarvestDate(),
            request.getExpireDate(),
            request.getDetailDesc()
        );

        // 4) PRODUCT_IMAGE INSERT (대표 + 상세 이미지들)
        int sortOrder = 1;

        // 4-1) 대표 이미지
        if (mainImagePath != null) {
            Long imageId = producerMapper.getNextProductImageId();
            producerMapper.insertProductImage(
                    productId,
                    imageId,
                    mainImagePath,
                    "Y",        // 대표
                    sortOrder   // 1번
            );
            sortOrder++;
        }

        // 4-2) 상세 이미지들 (최대 5장까지)
        if (descriptionImageFiles != null) {
            for (MultipartFile file : descriptionImageFiles) {
                if (file == null || file.isEmpty()) continue;
                if (sortOrder > 5) break;  // ★ 최대 5까지

                String descImagePath = saveImageFile(file);
                Long imageId = producerMapper.getNextProductImageId();

                producerMapper.insertProductImage(
                        productId,
                        imageId,
                        descImagePath,
                        "N",            // 대표 아님
                        sortOrder
                );
                sortOrder++;
            }
        }

        // 5) 등록된 상품 한 건 다시 조회해서 반환
        return producerMapper.findProductItemByProductIdForProducer(producerId, productId);
    }

    @Override
    @Transactional
    public ProducerProductItemDto updateProduct(Long producerId, Long productId, ProducerProductSaveRequest request, MultipartFile mainImageFile, List<MultipartFile> descriptionImageFiles) {

        // 1) 새 대표 이미지가 올라온 경우에만 저장
        String mainImagePath = null;
        if (mainImageFile != null && !mainImageFile.isEmpty()) {
            mainImagePath = saveImageFile(mainImageFile);
        }

        // 2) PRODUCT UPDATE (summary 포함)
        producerMapper.updateProductByProducer(
            producerId,
            productId,
            request.getProductName(),
            request.getBaseCategoryId(),
            request.getStatus(),
            mainImagePath,          // null 이면 NVL로 기존 유지
            request.getSummary()
        );

        // 3) PRODUCT_DETAIL UPDATE (상세 설명 포함)
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

        if (descriptionImageFiles != null) {
            int sortOrderBase = 2; // 대표가 1번이라는 가정 (정교하게 하려면 SELECT 로 max(sort_order)+1 조회)

            for (MultipartFile file : descriptionImageFiles) {
                if (file == null || file.isEmpty()) continue;

                String descImagePath = saveImageFile(file);
                Long imageId = producerMapper.getNextProductImageId();

                producerMapper.insertProductImage(
                        productId,
                        imageId,
                        descImagePath,
                        "N",
                        sortOrderBase++
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

}