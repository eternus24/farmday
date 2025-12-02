// src/main/java/com/farmday/admin/product/controller/AdminProductController.java
package com.farmday.admin.controller;

import com.farmday.admin.dto.AdminProductListItemDto;
import com.farmday.admin.dto.AdminProductStatsDto;
import com.farmday.admin.service.AdminProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    // 상품 리스트 (검색 + 페이징)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        long totalElements = adminProductService.countProducts(keyword);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        List<AdminProductListItemDto> content =
                adminProductService.getProducts(keyword, page, size);

        Map<String, Object> body = new HashMap<>();
        body.put("content", content);
        body.put("totalElements", totalElements); // 프론트가 안 써도 그냥 넣어둬도 됨
        body.put("totalPages", totalPages);
        body.put("page", page);
        body.put("size", size);

        return ResponseEntity.ok(body);
    }

    // 상품 통계
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminProductStatsDto>> getProductStats(
            @RequestParam(name = "period", defaultValue = "30") int periodDays,
            @RequestParam(name = "sort", defaultValue = "SALES") String sortKey
    ) {
        List<AdminProductStatsDto> result =
                adminProductService.getProductStats(periodDays, sortKey);
        return ResponseEntity.ok(result);
    }

    // 상품 삭제 (soft delete)
    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        adminProductService.deleteProduct(productId);
        return ResponseEntity.ok().build();
    }
}