// backend/src/main/java/com/farmday/price/RegionPriceDto.java
package com.farmday.price;

public class RegionPriceDto {

    // 지역별 가격 비교용 DTO

    private String regionCode; // 예: 1101
    private String regionName; // 예: 서울
    private int price;         // 오늘 가격

    public RegionPriceDto() {
    }

    public RegionPriceDto(String regionCode, String regionName, int price) {
        this.regionCode = regionCode;
        this.regionName = regionName;
        this.price = price;
    }

    public String getRegionCode() {
        return regionCode;
    }

    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }
}
