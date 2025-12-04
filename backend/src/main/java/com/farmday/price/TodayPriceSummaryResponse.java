// backend/src/main/java/com/farmday/price/TodayPriceSummaryResponse.java
package com.farmday.price;

import java.util.List;

public class TodayPriceSummaryResponse {

    // 시세 페이지 상단 요약에 쓸 데이터 묶음

    private List<PriceCardDto> topFallingItems; // 오늘 많이 떨어진 품목
    private List<PriceCardDto> topRisingItems;  // 오늘 많이 오른 품목
    private List<PriceCardDto> allItems;        // 오늘 전체 시세 리스트(필요시)

    public TodayPriceSummaryResponse() {
    }

    public TodayPriceSummaryResponse(List<PriceCardDto> topFallingItems,
                                     List<PriceCardDto> topRisingItems,
                                     List<PriceCardDto> allItems) {
        this.topFallingItems = topFallingItems;
        this.topRisingItems = topRisingItems;
        this.allItems = allItems;
    }

    public List<PriceCardDto> getTopFallingItems() {
        return topFallingItems;
    }

    public void setTopFallingItems(List<PriceCardDto> topFallingItems) {
        this.topFallingItems = topFallingItems;
    }

    public List<PriceCardDto> getTopRisingItems() {
        return topRisingItems;
    }

    public void setTopRisingItems(List<PriceCardDto> topRisingItems) {
        this.topRisingItems = topRisingItems;
    }

    public List<PriceCardDto> getAllItems() {
        return allItems;
    }

    public void setAllItems(List<PriceCardDto> allItems) {
        this.allItems = allItems;
    }
}
