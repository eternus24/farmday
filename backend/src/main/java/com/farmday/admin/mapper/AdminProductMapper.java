// src/main/java/com/farmday/admin/mapper/AdminProductMapper.java
package com.farmday.admin.mapper;

import com.farmday.admin.dto.AdminProductListItemDto;
import com.farmday.admin.dto.AdminProductStatsDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminProductMapper {

    // 목록/통계는 그대로 두고...

    long countProducts(@Param("keyword") String keyword);

    List<AdminProductListItemDto> findProducts(
            @Param("keyword") String keyword,
            @Param("offset") int offset,
            @Param("size") int size
    );

    List<AdminProductStatsDto> findProductStats(
            @Param("period") int periodDays,
            @Param("sort") String sortKey
    );

    // ==============================
    // 삭제 관련
    // ==============================

    long countOrderItemsByProductId(@Param("productId") Long productId);

    void deleteProductReviewsByProductId(@Param("productId") Long productId);

    void deleteProductQnaByProductId(@Param("productId") Long productId);

    void deleteProductImagesByProductId(@Param("productId") Long productId);

    void deleteProductDetailsByProductId(@Param("productId") Long productId);

    int deleteProductHard(@Param("productId") Long productId);
}