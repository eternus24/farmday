// backend/src/main/java/com/farmday/price/KamisClient.java
package com.farmday.price;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;

@Component
public class KamisClient {

    private static final Logger log = LoggerFactory.getLogger(KamisClient.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String apiUrl;
    private final String certKey;
    private final String certId;

    public KamisClient(RestTemplate restTemplate,
                       @Value("${kamis.api-url}") String apiUrl,
                       @Value("${kamis.api-key}") String certKey,
                       @Value("${kamis.api-id}") String certId) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.certKey = certKey;
        this.certId = certId;
    }

    // 공통 URI 생성 (action + 인증 정보 + 파라미터)
    private URI buildUri(String action, MultiValueMap<String, String> params) {
        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();
        queryParams.add("action", action);
        queryParams.add("p_cert_key", certKey);
        queryParams.add("p_cert_id", certId);
        queryParams.add("p_returntype", "json"); // JSON 응답 강제

        if (params != null && !params.isEmpty()) {
            queryParams.addAll(params);
        }

        URI uri = UriComponentsBuilder
                .fromHttpUrl(apiUrl)
                .queryParams(queryParams)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();

        if (log.isDebugEnabled()) {
            log.debug("KAMIS URI [{}]: {}", action, uri);
        }
        return uri;
    }

    // 공통 호출 + JsonNode 반환
    private JsonNode getForJson(URI uri) {
        String json = restTemplate.getForObject(uri, String.class);

        if (log.isDebugEnabled()) {
            String preview = json != null && json.length() > 300
                    ? json.substring(0, 300) + "..."
                    : json;
            log.debug("KAMIS raw response preview: {}", preview);
        }

        try {
            JsonNode root = objectMapper.readTree(json);

            // 에러 코드 위치가 엔드포인트마다 조금 달라서 루트 우선 확인
            JsonNode errorCode = root.path("error_code");
            if ((errorCode.isMissingNode() || errorCode.asText().isEmpty())) {
                // 일부 XML → JSON 변환 결과가 data.error_code 에 있을 수 있음 (방어용)
                errorCode = root.path("data").path("error_code");
            }
            if (!errorCode.isMissingNode() && !errorCode.asText().isEmpty()) {
                log.info("KAMIS error_code: {}", errorCode.asText());
            }

            return root;
        } catch (Exception e) {
            log.error("KAMIS 응답 파싱 실패: {}", e.getMessage(), e);
            throw new RuntimeException("KAMIS 응답 파싱 실패: " + e.getMessage(), e);
        }
    }

    // 1번: 일별 부류별 도·소매가격정보
    public JsonNode getDailyPriceByCategory(String productClsCode,
                                            String itemCategoryCode,
                                            String countryCode,
                                            String regDay,
                                            String convertKgYn) {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        if (productClsCode != null && !productClsCode.isEmpty()) {
            params.add("p_product_cls_code", productClsCode);
        }
        if (itemCategoryCode != null && !itemCategoryCode.isEmpty()) {
            params.add("p_item_category_code", itemCategoryCode);
        }
        if (countryCode != null && !countryCode.isEmpty()) {
            params.add("p_country_code", countryCode);
        }
        if (regDay != null && !regDay.isEmpty()) {
            params.add("p_regday", regDay);
        }
        if (convertKgYn != null && !convertKgYn.isEmpty()) {
            params.add("p_convert_kg_yn", convertKgYn);
        }

        URI uri = buildUri("dailyPriceByCategoryList", params);
        return getForJson(uri);
    }

    // 6번: 최근일자 도·소매가격정보(상품 기준) → 메인 카드, 오늘 시세 리스트
    public JsonNode getDailySalesList() {
        URI uri = buildUri("dailySalesList", null);
        return getForJson(uri);
    }

    // 7번: 최근 가격추이 조회(상품 기준) → 품목 상세 그래프
    public JsonNode getRecentlyPriceTrend(String productNo, String regDay) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("p_productno", productNo); // 품목코드(필수)

        if (regDay != null && !regDay.isEmpty()) {
            params.add("p_regday", regDay);
        }

        URI uri = buildUri("recentlyPriceTrendList", params);
        return getForJson(uri);
    }

    // 8번: 월평균 가격추이 조회(상품 기준) → 시즌 패턴
    public JsonNode getMonthlyPriceTrend(String productNo, String regDay) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("p_productno", productNo); // 품목코드(필수)

        if (regDay != null && !regDay.isEmpty()) {
            params.add("p_regday", regDay);
        }

        URI uri = buildUri("monthlyPriceTrendList", params);
        return getForJson(uri);
    }

    // 10번: 최근일자 지역별 도·소매가격정보(상품 기준) → 지역 비교
    public JsonNode getDailyCountyList(String countyCode) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("p_countycode", countyCode); // 지역 코드

        URI uri = buildUri("dailyCountyList", params);
        return getForJson(uri);
    }
}
