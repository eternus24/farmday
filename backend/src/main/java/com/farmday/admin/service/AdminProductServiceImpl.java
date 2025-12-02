// src/main/java/com/farmday/admin/product/service/AdminProductServiceImpl.java
package com.farmday.admin.service;

import com.farmday.admin.dto.AdminProductListItemDto;
import com.farmday.admin.dto.AdminProductStatsDto;
import com.farmday.admin.mapper.AdminProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProductServiceImpl implements AdminProductService {

    private final AdminProductMapper adminProductMapper;

    @Override
    public long countProducts(String keyword) {
        return adminProductMapper.countProducts(keyword);
    }

    @Override
    public List<AdminProductListItemDto> getProducts(
            String keyword,
            int page,
            int size
    ) {
        if (page < 1) page = 1;
        if (size < 1) size = 20;

        int offset = (page - 1) * size;
        return adminProductMapper.findProducts(keyword, offset, size);
    }

    @Override
    public List<AdminProductStatsDto> getProductStats(int periodDays, String sortKey) {
        if (periodDays <= 0) periodDays = 30;
        if (sortKey == null || sortKey.isEmpty()) sortKey = "SALES";
        return adminProductMapper.findProductStats(periodDays, sortKey);
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId) {
        // 1) 주문 존재 여부 체크
        long orderItemCount = adminProductMapper.countOrderItemsByProductId(productId);
        if (orderItemCount > 0) {
            throw new IllegalStateException(
                    "이미 주문이 발생한 상품은 삭제할 수 없습니다. productId=" + productId
            );
        }

        // 2) 연관 데이터 삭제 (순서는 크게 상관 없지만 이렇게 통일)
        adminProductMapper.deleteProductReviewsByProductId(productId);
        adminProductMapper.deleteProductQnaByProductId(productId);
        adminProductMapper.deleteProductImagesByProductId(productId);
        adminProductMapper.deleteProductDetailsByProductId(productId);

        // 3) 마지막으로 PRODUCT 삭제
        int deleted = adminProductMapper.deleteProductHard(productId);
        if (deleted == 0) {
            throw new IllegalArgumentException("상품을 찾을 수 없습니다. productId=" + productId);
        }
    }
}