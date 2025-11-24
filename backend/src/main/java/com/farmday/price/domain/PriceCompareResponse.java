// backend/src/main/java/com/farmday/price/domain/PriceCompareResponse.java
package com.farmday.price.domain;

import java.math.BigDecimal;

// 프론트에 내려줄 시세 비교 결과 DTO
public class PriceCompareResponse {

   
    private String itemId;  // 상품(품목) ID
    private BigDecimal salePrice;     // 상품 판매가
    private BigDecimal marketPrice; // 현재 시세 (MARKET 기준)
    private BigDecimal differenceRate;  // 차이율 (%) 숫자 (예: -10.5 → 10.5% 저렴)
    private String differenceLabel; // 차이율 문구 (예: "10% 저렴", "5% 비쌈")
    private int recommendationStars;  // 추천 등급 (별 개수)
    private String recommendationMessage; // 추천 메시지 (예: "지금 사기 좋아요")
    private String seasonAdvice; // 계절 정보 (예: "봄 배추는 제철입니다")

    // 기본 생성자
    public PriceCompareResponse() {
    }

    // 편한 생성자 (필요하면 추가)
    public PriceCompareResponse(String itemId,
                                BigDecimal salePrice,
                                BigDecimal marketPrice,
                                BigDecimal differenceRate,
                                String differenceLabel,
                                int recommendationStars,
                                String recommendationMessage,
                                String seasonAdvice) {
        this.itemId = itemId;
        this.salePrice = salePrice;
        this.marketPrice = marketPrice;
        this.differenceRate = differenceRate;
        this.differenceLabel = differenceLabel;
        this.recommendationStars = recommendationStars;
        this.recommendationMessage = recommendationMessage;
        this.seasonAdvice = seasonAdvice;
    }

    // getter / setter (롬복 쓰면 @Data로 대체 가능)

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public void setSalePrice(BigDecimal salePrice) {
        this.salePrice = salePrice;
    }

    public BigDecimal getMarketPrice() {
        return marketPrice;
    }

    public void setMarketPrice(BigDecimal marketPrice) {
        this.marketPrice = marketPrice;
    }

    public BigDecimal getDifferenceRate() {
        return differenceRate;
    }

    public void setDifferenceRate(BigDecimal differenceRate) {
        this.differenceRate = differenceRate;
    }

    public String getDifferenceLabel() {
        return differenceLabel;
    }

    public void setDifferenceLabel(String differenceLabel) {
        this.differenceLabel = differenceLabel;
    }

    public int getRecommendationStars() {
        return recommendationStars;
    }

    public void setRecommendationStars(int recommendationStars) {
        this.recommendationStars = recommendationStars;
    }

    public String getRecommendationMessage() {
        return recommendationMessage;
    }

    public void setRecommendationMessage(String recommendationMessage) {
        this.recommendationMessage = recommendationMessage;
    }

    public String getSeasonAdvice() {
        return seasonAdvice;
    }

    public void setSeasonAdvice(String seasonAdvice) {
        this.seasonAdvice = seasonAdvice;
    }
}
