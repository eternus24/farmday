// backend/src/main/java/com/farmday/price/service/PriceAnalysisService.java
package com.farmday.price.service;

import com.farmday.price.domain.PriceCompareResponse;
import com.farmday.price.domain.PriceMarket;
import com.farmday.price.mapper.PriceMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

// 시세 vs 판매가 비교, 추천, 계절정보 계산 서비스
@Service
public class PriceAnalysisService {

    private final PriceMapper priceMapper;

    public PriceAnalysisService(PriceMapper priceMapper) {
        this.priceMapper = priceMapper;
    }

    // 컨트롤러에서 호출하는 메인 메서드
    public PriceCompareResponse analyzePriceComparison(String itemId, BigDecimal salePrice) {
        // 1. 현재 시세 조회
        PriceMarket market = getMarketPrice(itemId);

        if (market == null) {
            // 시세가 없을 때 기본 응답
            PriceCompareResponse res = new PriceCompareResponse();
            res.setItemId(itemId);
            res.setSalePrice(salePrice);
            res.setMarketPrice(null);
            res.setDifferenceRate(null);
            res.setDifferenceLabel("시세 정보 없음");
            res.setRecommendationStars(0);
            res.setRecommendationMessage("시세 데이터가 없습니다");
            res.setSeasonAdvice(getSeasonAdvice(itemId, LocalDate.now()));
            return res;
        }

        BigDecimal marketPrice = market.getPrice();

        // 2. 차이율 계산
        BigDecimal diffRate = calculateDifference(salePrice, marketPrice);
        String diffLabel = buildDifferenceLabel(diffRate);

        // 3. 추천 등급 계산
        int stars = getRecommendationGrade(diffRate);
        String message = buildRecommendationMessage(stars);

        // 4. 계절 정보
        String seasonAdvice = getSeasonAdvice(itemId, LocalDate.now());

        // 5. 응답 DTO 조립
        PriceCompareResponse res = new PriceCompareResponse();
        res.setItemId(itemId);
        res.setSalePrice(salePrice);
        res.setMarketPrice(marketPrice);
        res.setDifferenceRate(diffRate);
        res.setDifferenceLabel(diffLabel);
        res.setRecommendationStars(stars);
        res.setRecommendationMessage(message);
        res.setSeasonAdvice(seasonAdvice);

        return res;
    }

    // 최신 시세 조회
    public PriceMarket getMarketPrice(String itemId) {
        return priceMapper.selectPriceByItemId(itemId);
    }

    // 차이율 계산: (시세 - 판매가) / 시세 * 100
    public BigDecimal calculateDifference(BigDecimal salePrice, BigDecimal marketPrice) {
        if (salePrice == null || marketPrice == null || marketPrice.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        BigDecimal diff = marketPrice.subtract(salePrice)
                .divide(marketPrice, 4, RoundingMode.HALF_UP) // 소수점 넉넉히
                .multiply(BigDecimal.valueOf(100));            // %
        return diff.setScale(1, RoundingMode.HALF_UP);         // 소수점 1자리
    }

    // 차이율 텍스트 생성
    public String buildDifferenceLabel(BigDecimal diffRate) {
        if (diffRate == null) {
            return "차이율 계산 불가";
        }
        BigDecimal abs = diffRate.abs();
        if (diffRate.compareTo(BigDecimal.ZERO) > 0) {
            // 시세 > 판매가 → 판매가가 더 싸다
            return abs.stripTrailingZeros().toPlainString() + "% 저렴";
        } else if (diffRate.compareTo(BigDecimal.ZERO) < 0) {
            // 시세 < 판매가 → 판매가가 더 비싸다
            return abs.stripTrailingZeros().toPlainString() + "% 비쌈";
        } else {
            return "시세와 동일";
        }
    }

    // 추천 등급 (별 개수) 계산 예시 로직
    public int getRecommendationGrade(BigDecimal diffRate) {
        if (diffRate == null) {
            return 0;
        }
        // diffRate > 0 → 싸게 파는 중
        if (diffRate.compareTo(BigDecimal.valueOf(20)) >= 0) {
            return 5;   // 20% 이상 저렴
        } else if (diffRate.compareTo(BigDecimal.valueOf(10)) >= 0) {
            return 4;   // 10~20% 저렴
        } else if (diffRate.compareTo(BigDecimal.valueOf(0)) >= 0) {
            return 3;   // 0~10% 저렴
        } else if (diffRate.compareTo(BigDecimal.valueOf(-10)) >= 0) {
            return 2;   // 최대 10% 비쌈
        } else {
            return 1;   // 10% 이상 비쌈
        }
    }

    // 추천 메시지 생성
    public String buildRecommendationMessage(int stars) {
        if (stars >= 5) {
            return "지금 사기 아주 좋아요";
        } else if (stars == 4) {
            return "지금 사기 좋아요";
        } else if (stars == 3) {
            return "무난한 가격이에요";
        } else if (stars == 2) {
            return "조금 더 기다려도 좋아요";
        } else if (stars == 1) {
            return "지금은 비싼 편이에요";
        } else {
            return "추천 정보를 제공할 수 없습니다";
        }
    }

    // 계절 정보 (간단 예시 / TODO: 실제 로직으로 교체)
    public String getSeasonAdvice(String itemId, LocalDate today) {
        // TODO: itemId별 제철 월 정의해서 로직 보완
        int month = today.getMonthValue();
        if (month >= 3 && month <= 5) {
            return "봄철 농산물은 전반적으로 신선합니다";
        } else if (month >= 6 && month <= 8) {
            return "여름철에는 저장성이 떨어질 수 있어요";
        } else if (month >= 9 && month <= 11) {
            return "가을은 수확철이라 가격 변동이 큽니다";
        } else {
            return "겨울철에는 일부 품목 가격이 오를 수 있어요";
        }
    }
}
