// backend/src/main/java/com/farmday/price/PriceServiceImpl.java
package com.farmday.price;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PriceServiceImpl implements PriceService {

    private final KamisClient kamisClient;

    // 메인 시세카드에 사용할 랜덤 시드
    private final Random random = new Random();

    public PriceServiceImpl(KamisClient kamisClient) {
        this.kamisClient = kamisClient;
    }

    @Override
    public List<PriceCardDto> getMainTickerCards(int limit) {
        List<PriceCardDto> all = getTodayCardsInternal();
        if (all.isEmpty()) {
            return Collections.emptyList();
        }

        // 랜덤하게 섞은 뒤 상위 N개만 사용
        Collections.shuffle(all, random);
        if (all.size() <= limit) {
            return all;
        }
        return all.subList(0, limit);
    }

    @Override
    public TodayPriceSummaryResponse getTodaySummary() {
        List<PriceCardDto> all = getTodayCardsInternal();

        // 하락률 기준 TOP3
        List<PriceCardDto> falling = all.stream()
                .filter(c -> !c.isUp() && c.getDiffRate() != 0.0)
                .sorted(Comparator.comparingDouble(PriceCardDto::getDiffRate)) // 음수 작은순
                .limit(3)
                .collect(Collectors.toList());

        // 상승률 기준 TOP3
        List<PriceCardDto> rising = all.stream()
                .filter(PriceCardDto::isUp)
                .sorted(Comparator.comparingDouble(PriceCardDto::getDiffRate).reversed())
                .limit(3)
                .collect(Collectors.toList());

        return new TodayPriceSummaryResponse(falling, rising, all);
    }

    @Override
    public PriceTrendResponse getPriceTrend(String productNo) {
        JsonNode recentNode = kamisClient.getRecentlyPriceTrend(productNo, null);
        JsonNode monthlyNode = kamisClient.getMonthlyPriceTrend(productNo, null);

        // 아래 필드명은 KAMIS 응답 구조에 따라 조정 필요
        String productName = recentNode.path("productName").asText("");
        String unit = recentNode.path("unit").asText("");

        List<PriceTrendPointDto> dailyPoints = new ArrayList<>();
        JsonNode recentList = recentNode.path("data");
        for (JsonNode item : recentList) {
            // 예시: {"date":"2025-02-01","price":1234}
            LocalDate date = LocalDate.parse(item.path("date").asText());
            int price = parsePrice(item.path("price").asText());
            dailyPoints.add(new PriceTrendPointDto(date, price));
        }

        List<PriceTrendPointDto> monthlyPoints = new ArrayList<>();
        JsonNode monthlyList = monthlyNode.path("data");
        for (JsonNode item : monthlyList) {
            // 예시: {"year":"2025","month":"02","price":1234}
            String year = item.path("year").asText();
            String month = item.path("month").asText();
            int price = parsePrice(item.path("price").asText());

            LocalDate date = LocalDate.of(
                    Integer.parseInt(year),
                    Integer.parseInt(month),
                    1
            );
            monthlyPoints.add(new PriceTrendPointDto(date, price));
        }

        return new PriceTrendResponse(productName, unit, dailyPoints, monthlyPoints);
    }

    @Override
    public RegionCompareResponse getRegionCompare(String productNo) {
        // 비교할 대표 지역들 (서울, 부산, 대구, 광주, 대전)
        String[][] regionPairs = {
                {"1101", "서울"},
                {"2100", "부산"},
                {"2200", "대구"},
                {"2401", "광주"},
                {"2501", "대전"}
        };

        List<RegionPriceDto> regions = new ArrayList<>();
        String productName = "";
        String unit = "";

        for (String[] pair : regionPairs) {
            String code = pair[0];
            String name = pair[1];

            JsonNode root = kamisClient.getDailyCountyList(code);
            JsonNode items = root.path("data");

            // 품목코드로 필터링 (필드명은 실제 구조에 맞춰 조정)
            for (JsonNode item : items) {
                String itemProductNo = item.path("productNo").asText();
                if (!productNo.equals(itemProductNo)) {
                    continue;
                }

                productName = item.path("item_name").asText("");
                unit = item.path("unit").asText("");
                int todayPrice = parsePrice(item.path("dpr1").asText());

                regions.add(new RegionPriceDto(code, name, todayPrice));
                break;
            }
        }

        return new RegionCompareResponse(productName, unit, regions);
    }

    // ─────────────────────────────────────────────────────
    // 내부 공통: 오늘 기준 시세 카드 리스트  ✅ 여기만 로직 수정
    // ─────────────────────────────────────────────────────
    private List<PriceCardDto> getTodayCardsInternal() {
        // KAMIS 6번 API: dailySalesList 호출
        JsonNode root = kamisClient.getDailySalesList();

        List<PriceCardDto> result = new ArrayList<>();

        /*
         * 실제 KAMIS dailySalesList JSON 구조(로그 기준 예시):
         *
         * {
         *   "condition": [...],
         *   "error_code": "000",
         *   "price": [
         *     {
         *       "product_cls_code": "01",
         *       "product_cls_name": "소매",
         *       "category_code": "100",
         *       "category_name": "식량작물",
         *       "productno": "272",
         *       "lastest_day": "2025-12-03",
         *       "productName": "쌀/20kg",
         *       "item_name": "쌀/20kg",
         *       "unit": "20kg",
         *       "day1": "당일",
         *       "dpr1": "62,057",
         *       "day2": "1일전",
         *       "dpr2": "61,000"
         *       ...
         *     },
         *     ...
         *   ]
         * }
         *
         * → 우리가 필요한 배열 이름은 "price" 이다.
         */

        // dailySalesList 에서는 price 배열이 핵심
        JsonNode items = root.path("price");

        // 방어 로직: 혹시 모를 다른 구조(data / data.item)를 위해 한 번 더 확인
        if (!items.isArray()) {
            JsonNode dataNode = root.path("data");
            if (dataNode.isArray()) {
                items = dataNode;
            } else {
                JsonNode dataItem = dataNode.path("item");
                if (dataItem.isArray()) {
                    items = dataItem;
                }
            }
        }

        // 여전히 배열이 아니면 유효 데이터 없음
        if (!items.isArray()) {
            return result;
        }

        // 각 품목을 PriceCardDto 로 변환
        for (JsonNode item : items) {
            // productName 이 없으면 item_name 으로 대체
            String productName = item.path("productName")
                    .asText(item.path("item_name").asText(""));
            String unit = item.path("unit").asText("");

            // dpr1: 당일, dpr2: 1일전 (문자열 금액)
            int today = parsePrice(item.path("dpr1").asText());
            int dayBefore = parsePrice(item.path("dpr2").asText());

            // 둘 중 하나라도 0(값 없음)이면 스킵
            if (today <= 0 || dayBefore <= 0) {
                continue;
            }

            int diffPrice = Math.abs(today - dayBefore);
            double diffRate = Math.round(((today - dayBefore) * 10000.0 / dayBefore)) / 100.0;
            boolean up = today > dayBefore;

            PriceCardDto dto = new PriceCardDto(
                    productName,
                    unit,
                    today,
                    diffPrice,
                    diffRate,
                    up
            );
            result.add(dto);
        }

        return result;
    }

    // "12,345" 또는 "" 같은 문자열을 안전하게 int 로 변환
    private int parsePrice(String value) {
        if (value == null || value.trim().isEmpty() || "-".equals(value.trim())) {
            return 0;
        }
        String numeric = value.replaceAll("[^0-9]", "");
        if (numeric.isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(numeric);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    //민아 - 시세 정보
    @Override
    public Map<String, Object> getPriceDetail(String item) {

        //이미 정상 동작 중인 내부 KAMIS 오늘 시세 리스트 재사용
        List<PriceCardDto> allItems = getTodayCardsInternal();

        //한글 품목명이 포함된 항목 찾기 (ex: "토마토" → "토마토/1kg")
        for (PriceCardDto dto : allItems) {

            if (dto.getProductName().contains(item)) {

                Map<String, Object> result = new HashMap<>();

                result.put("productName", dto.getProductName());
                result.put("unit", dto.getUnit());
                result.put("todayPrice", dto.getTodayPrice());
                result.put("diffRate", dto.getDiffRate());
                result.put("diffPrice", dto.getDiffPrice());
                result.put("up", dto.isUp());

                return result;
            }
        }

        //못 찾았을 경우도 프론트 안 터지게 안전 처리
        Map<String, Object> empty = new HashMap<>();
        empty.put("productName", item);
        empty.put("unit", "");
        empty.put("todayPrice", 0);
        empty.put("diffRate", 0);
        empty.put("diffPrice", 0);
        empty.put("up", false);

        return empty;
    }
    
}
