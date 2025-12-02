// src/main/java/com/farmday/admin/product/service/AdminProductService.java
package com.farmday.admin.service;

import com.farmday.admin.dto.AdminProductListItemDto;
import com.farmday.admin.dto.AdminProductStatsDto;

import java.util.List;

public interface AdminProductService {

    long countProducts(String keyword);

    List<AdminProductListItemDto> getProducts(
            String keyword,
            int page,
            int size
    );

    List<AdminProductStatsDto> getProductStats(
            int periodDays,
            String sortKey
    );

    void deleteProduct(Long productId);
}