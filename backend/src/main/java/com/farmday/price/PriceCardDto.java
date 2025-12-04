// backend/src/main/java/com/farmday/price/PriceCardDto.java
package com.farmday.price;

public class PriceCardDto {

    // 메인/시세페이지 공통 카드용 DTO

    private String productName;    // 예: "배추(일반배추)"
    private String unit;           // 예: "10KG/특"
    private int todayPrice;        // 오늘 가격
    private int diffPrice;         // 전일 대비 금액 차이 (절대값)
    private double diffRate;       // 전일 대비 증감률 (%)
    private boolean up;            // true면 상승, false면 하락 또는 보합

    public PriceCardDto() {
    }

    public PriceCardDto(String productName, String unit,
                        int todayPrice, int diffPrice,
                        double diffRate, boolean up) {
        this.productName = productName;
        this.unit = unit;
        this.todayPrice = todayPrice;
        this.diffPrice = diffPrice;
        this.diffRate = diffRate;
        this.up = up;
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

    public int getTodayPrice() {
        return todayPrice;
    }

    public void setTodayPrice(int todayPrice) {
        this.todayPrice = todayPrice;
    }

    public int getDiffPrice() {
        return diffPrice;
    }

    public void setDiffPrice(int diffPrice) {
        this.diffPrice = diffPrice;
    }

    public double getDiffRate() {
        return diffRate;
    }

    public void setDiffRate(double diffRate) {
        this.diffRate = diffRate;
    }

    public boolean isUp() {
        return up;
    }

    public void setUp(boolean up) {
        this.up = up;
    }
}
