// backend/src/main/java/com/farmday/price/PriceTrendResponse.java
package com.farmday.price;

import java.util.List;

public class PriceTrendResponse {

    // 상세 모달에서 쓸 가격 추이 응답

    private String productName;
    private String unit;
    private List<PriceTrendPointDto> dailyPoints;   // 최근 일별
    private List<PriceTrendPointDto> monthlyPoints; // 월평균 (옵션)

    public PriceTrendResponse() {
    }

    public PriceTrendResponse(String productName, String unit,
                              List<PriceTrendPointDto> dailyPoints,
                              List<PriceTrendPointDto> monthlyPoints) {
        this.productName = productName;
        this.unit = unit;
        this.dailyPoints = dailyPoints;
        this.monthlyPoints = monthlyPoints;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public List<PriceTrendPointDto> getDailyPoints() {
        return dailyPoints;
    }

    public void setDailyPoints(List<PriceTrendPointDto> dailyPoints) {
        this.dailyPoints = dailyPoints;
    }

    public List<PriceTrendPointDto> getMonthlyPoints() {
        return monthlyPoints;
    }

    public void setMonthlyPoints(List<PriceTrendPointDto> monthlyPoints) {
        this.monthlyPoints = monthlyPoints;
    }
}
