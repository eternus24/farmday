// backend/src/main/java/com/farmday/price/PriceTrendPointDto.java
package com.farmday.price;

import java.time.LocalDate;

public class PriceTrendPointDto {

    // 날짜별 시세 그래프 한 점

    private LocalDate date;
    private int price;

    public PriceTrendPointDto() {
    }

    public PriceTrendPointDto(LocalDate date, int price) {
        this.date = date;
        this.price = price;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }
}
