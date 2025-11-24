// backend/src/main/java/com/farmday/price/domain/PriceDaily.java
package com.farmday.price.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

// 일별 시세 기록
public class PriceDaily {

    private Long id;               // PK
    private String itemId;         // 품목 ID
    private String marketName;     // 시장 이름
    private LocalDate baseDate;    // 날짜
    private BigDecimal price;      // 일별 시세

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
