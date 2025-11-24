// backend/src/main/java/com/farmday/price/controller/PriceController.java
package com.farmday.price.controller;

import com.farmday.price.domain.PriceCompareResponse;
import com.farmday.price.service.PriceAnalysisService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

// 가격 관련 REST API 컨트롤러
@RestController
@RequestMapping("/api/price")
public class PriceController {

    private final PriceAnalysisService priceAnalysisService;

    public PriceController(PriceAnalysisService priceAnalysisService) {
        this.priceAnalysisService = priceAnalysisService;
    }

    // GET /api/price/{itemId}?salePrice=1234
    // 상품 파트에서 (itemId, salePrice)를 넘겨주면
    // 시세 vs 판매가 비교 결과를 반환
    @GetMapping("/{itemId}")
    public PriceCompareResponse getPriceCompare(
            @PathVariable("itemId") String itemId,
            @RequestParam("salePrice") BigDecimal salePrice
    ) {
        return priceAnalysisService.analyzePriceComparison(itemId, salePrice);
    }
}
