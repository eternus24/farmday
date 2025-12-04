// backend/src/main/java/com/farmday/price/PriceService.java
package com.farmday.price;

import java.util.List;

public interface PriceService {

    // 메인 페이지에 흘러가는 시세 카드
    List<PriceCardDto> getMainTickerCards(int limit);

    // 시세 페이지 상단 요약(오늘의 상승/하락 TOP)
    TodayPriceSummaryResponse getTodaySummary();

    // 품목 상세 그래프용
    PriceTrendResponse getPriceTrend(String productNo);

    // 지역별 가격 비교
    RegionCompareResponse getRegionCompare(String productNo);
}
