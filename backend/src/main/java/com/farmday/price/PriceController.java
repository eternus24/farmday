// backend/src/main/java/com/farmday/price/PriceController.java
package com.farmday.price;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price")
public class PriceController {

    private final PriceService priceService;

    public PriceController(PriceService priceService) {
        this.priceService = priceService;
    }

    // 메인 페이지 상단에 흘러갈 시세 카드 리스트
    // 예: GET /api/price/main-cards?limit=10
    @GetMapping("/main-cards")
    public List<PriceCardDto> getMainCards(@RequestParam(defaultValue = "10") int limit) {
        return priceService.getMainTickerCards(limit);
    }

    // 시세 페이지 상단 요약 (오늘 많이 떨어진/오른 품목)
    // 예: GET /api/price/today-summary
    @GetMapping("/today-summary")
    public TodayPriceSummaryResponse getTodaySummary() {
        return priceService.getTodaySummary();
    }

    // 품목 상세 모달 – 최근 일/월 가격 추이
    // 예: GET /api/price/trend?productNo=212
    @GetMapping("/trend")
    public PriceTrendResponse getTrend(@RequestParam("productNo") String productNo) {
        return priceService.getPriceTrend(productNo);
    }

    // 품목별 지역 가격 비교
    // 예: GET /api/price/region-compare?productNo=212
    @GetMapping("/region-compare")
    public RegionCompareResponse getRegionCompare(@RequestParam("productNo") String productNo) {
        return priceService.getRegionCompare(productNo);
    }
}
