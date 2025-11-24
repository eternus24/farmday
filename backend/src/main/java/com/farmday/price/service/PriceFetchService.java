// 경로: backend/src/main/java/com/farmday/price/service/PriceFetchService.java
package com.farmday.price.service;

import com.farmday.price.domain.PriceDaily;
import com.farmday.price.domain.PriceFetchLog;
import com.farmday.price.mapper.PriceMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// KAMIS API를 이용해서 가격 데이터를 수집하고 DB에 저장하는 서비스
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceFetchService {

    // 시세 DB 저장용 매퍼
    private final PriceMapper priceMapper;

    // application.properties 에 설정한 KAMIS 키/URL
    @Value("${kamis.api-key}")
    private String apiKey;

    @Value("${kamis.api-url}")
    private String apiUrl;

    // 간단하게 서비스 안에서 RestTemplate 사용
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * KAMIS API 호출 → 파싱 → DB 저장 → 수집 로그 기록
     * (배치 스케줄러에서 이 메서드를 호출하게 됨)
     */
    public void fetchPricesFromKAMIS() {
        log.info("📌 KAMIS API 수집 시작");

        int savedCount = 0;

        try {
            // TODO: 실제 KAMIS 규격에 맞춰 파라미터(action, 날짜 등) 수정
            String requestUrl = apiUrl
                    + "?action=periodProductList"
                    + "&p_cert_key=" + apiKey
                    + "&p_cert_id=111"
                    + "&p_returntype=json";

            log.info("📡 요청 URL = {}", requestUrl);

            // 1) API 호출 (응답은 일단 String 으로 받음)
            String rawResponse = restTemplate.getForObject(requestUrl, String.class);

            // 2) 응답 파싱 → 일일 시세 리스트로 변환 (현재는 아직 미구현)
            List<PriceDaily> dailyList = parsePriceData(rawResponse);

            // 3) DB 저장
            savedCount = saveToDB(dailyList);

            log.info("✔ KAMIS 수집 완료 ({}건 저장)", savedCount);

            // 4) 성공 로그
            insertFetchLog(savedCount, "SUCCESS", null);

        } catch (Exception e) {
            log.error("❌ KAMIS API 수집 중 오류 발생", e);

            // 실패 로그
            insertFetchLog(savedCount, "FAIL", e.getMessage());
        }
    }

    /**
     * KAMIS API 응답(rawResponse)을 파싱해서
     * PriceDaily 리스트로 변환하는 자리
     *
     * 지금은 아직 파서 미구현 상태이므로
     * 빈 리스트만 반환하도록 해둠.
     *
     * 자바 8 호환을 위해 List.of() 대신 new ArrayList<>() 사용
     */
    private List<PriceDaily> parsePriceData(String rawResponse) {
        log.info("📄 KAMIS 데이터 파싱 시작");

        // TODO: rawResponse(JSON/XML)를 실제로 파싱해서 PriceDaily 객체 리스트 채우기
        return new ArrayList<PriceDaily>(); // Java 8에서도 OK
    }

    /**
     * 파싱된 일일 시세 리스트를 DB에 저장
     *
     * @param dailyList 파싱된 시세 목록
     * @return 실제로 저장한 건수
     */
    private int saveToDB(List<PriceDaily> dailyList) {
        int count = 0;

        if (dailyList == null || dailyList.isEmpty()) {
            log.info("⚠ 저장할 시세 데이터가 없습니다.");
            return count;
        }

        for (PriceDaily daily : dailyList) {
            // PRICE_DAILY 테이블에 저장
            priceMapper.insertPriceDaily(daily);
            count++;
        }

        return count;
    }

    /**
     * PRICE_FETCH_LOG 테이블에 수집 로그 저장
     *
     * @param fetchedCount  수집/저장 건수
     * @param status        "SUCCESS" / "FAIL"
     * @param errorMessage  실패 시 에러 메시지 (성공 시 null)
     */
    private void insertFetchLog(int fetchedCount, String status, String errorMessage) {
        PriceFetchLog logData = new PriceFetchLog();

        logData.setFetchedAt(LocalDateTime.now()); // 수집 시각
        logData.setFetchedCount(fetchedCount);     // 수집 건수
        logData.setStatus(status);                 // 상태
        logData.setErrorMessage(errorMessage);     // 실패 이유 (성공이면 null)

        priceMapper.insertPriceFetchLog(logData);
    }
}
