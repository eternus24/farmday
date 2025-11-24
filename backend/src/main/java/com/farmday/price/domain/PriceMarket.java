// backend/src/main/java/com/farmday/price/domain/PriceMarket.java
package com.farmday.price.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

// 시장별 최신 시세 정보
public class PriceMarket {

    private Long id;               // PK (옵션)
    private String itemId;         // 품목 ID
    private String marketName;     // 시장 이름
    private LocalDate baseDate;    // 기준일자
    private BigDecimal price;      // 평균 시세 (원)

    // getter / setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getMarketName() {
        return marketName;
    }

    public void setMarketName(String marketName) {
        this.marketName = marketName;
    }

    public LocalDate getBaseDate() {
        return baseDate;
    }

    public void setBaseDate(LocalDate baseDate) {
        this.baseDate = baseDate;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
