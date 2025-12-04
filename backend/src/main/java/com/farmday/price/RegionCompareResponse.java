// backend/src/main/java/com/farmday/price/RegionCompareResponse.java
package com.farmday.price;

import java.util.List;

public class RegionCompareResponse {

    // 한 품목에 대한 지역별 비교 결과

    private String productName;
    private String unit;
    private List<RegionPriceDto> regions;

    public RegionCompareResponse() {
    }

    public RegionCompareResponse(String productName, String unit, List<RegionPriceDto> regions) {
        this.productName = productName;
        this.unit = unit;
        this.regions = regions;
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

    public List<RegionPriceDto> getRegions() {
        return regions;
    }

    public void setRegions(List<RegionPriceDto> regions) {
        this.regions = regions;
    }
}
